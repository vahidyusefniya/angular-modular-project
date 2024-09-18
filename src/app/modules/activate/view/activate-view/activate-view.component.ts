import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  ExchangeService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import { ExchangeProduct } from "@app/modules/physical-gift-cards/dto/product.dto";
import { Branch } from "@app/proxy/proxy";
import {
  CategoryProduct,
  PhysicalCardActivation,
  PhysicalCardActivationStatus,
  PhysicalCardsClient,
  PlaceActivatePhysicalCardOrderRequest,
  ProductsClient,
} from "@app/proxy/shop-proxy";
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerOptions,
  CapacitorBarcodeScannerTypeHint,
} from "@capacitor/barcode-scanner";
import { dictionary } from "@dictionary/dictionary";
import { Platform } from "@ionic/angular";
import { BarcodeFormat } from "@zxing/library";
import { Subscription } from "rxjs";
import { ActivateDto } from "../../dto/activate.dto";
import { environment } from "@environments/environment";

@Component({
  selector: "app-activate-view",
  templateUrl: "./activate-view.component.html",
  styleUrls: ["./activate-view.component.scss"],
})
export class ActivateViewComponent implements OnDestroy {
  dictionary = dictionary;
  activateCode = "";
  openScanner = false;
  availableDevices: MediaDeviceInfo[] = [];
  deviceCurrent: MediaDeviceInfo | undefined;
  deviceSelected: string | undefined;
  qrResultString: string | undefined;
  formatsEnabled: BarcodeFormat[] = [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_93,
    BarcodeFormat.CODE_39,
    BarcodeFormat.MAXICODE,
    BarcodeFormat.CODABAR,
    BarcodeFormat.AZTEC,
    BarcodeFormat.EAN_8,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.EAN_13,
    BarcodeFormat.ITF,
    BarcodeFormat.PDF_417,
    BarcodeFormat.RSS_14,
    BarcodeFormat.RSS_EXPANDED,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.UPC_EAN_EXTENSION,
  ];
  tryHarder = false;
  hasPermission = false;
  hasDevices = false;
  branch: Branch | undefined;
  openActivationCodeModal = false;
  product = new CategoryProduct();
  physicalCardActivation = new PhysicalCardActivation();
  isOpenAlert = false;
  checkActivation$ = new Subscription();
  getProducts$ = new Subscription();
  activate$ = new Subscription();
  alertButtons = [
    {
      text: dictionary.Close,
      role: "cancel",
      cssClass: "",
      handler: () => {
        this.isOpenAlert = false;
      },
    },
  ];
  loading = false;
  message: string | undefined;
  header: string | undefined = "Cannot be activated";
  merchantId: number;
  totalPrice: number | undefined;
  placeActivatePhysicalCardOrder = new PlaceActivatePhysicalCardOrderRequest();
  exchangeSubject$ = new Subscription();
  isScan = false;
  interval$: any;
  isIosMode = false;

  @ViewChild("activeForm") activeForm: any;

  constructor(
    private physicalCardsClient: PhysicalCardsClient,
    private layoutService: LayoutService,
    private productsClient: ProductsClient,
    private notificationService: NotificationService,
    private coreService: CoreService,
    private exchangeService: ExchangeService,
    private platform: Platform
  ) {
    this.branch = this.layoutService.branch;
    this.merchantId = this.coreService.getMerchantId(
      this.coreService.getBranchId()!
    )!;
    this.exchangeSubject$ = this.exchangeService.exchangeSubject.subscribe(
      () => {
        const data = new ActivateDto();
        data.init({
          buyPrice: this.placeActivatePhysicalCardOrder.buyPrice,
          productPrice: this.placeActivatePhysicalCardOrder.productPrice,
          serialNumber: this.placeActivatePhysicalCardOrder.serialNumber,
          withExchange: true,
        });
        this.onActivationCode(data);
      }
    );
    this.isIosMode = environment.IOS__Scanner;
  }

  async startScan(): Promise<void> {
    try {
      let options: CapacitorBarcodeScannerOptions = {
        hint: CapacitorBarcodeScannerTypeHint.ALL,
      };
      const result = await CapacitorBarcodeScanner.scanBarcode(options);
      this.activateCode = result.ScanResult;
      this.onActivateClick();
    } catch (error) {
      throw Error(JSON.stringify(error));
    }
  }

  onDeviceChange(device: MediaDeviceInfo) {
    const selectedStr = device?.deviceId || "";
    if (this.deviceSelected === selectedStr) {
      return;
    }
    this.deviceSelected = selectedStr;
    this.deviceCurrent = device || undefined;
  }
  onCodeResult(resultString: string) {
    this.activateCode = resultString;
    this.openScanner = false;
    this.onActivateClick();
  }
  onHasPermission(has: boolean) {
    this.hasPermission = has;
  }
  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }

  cancelActivationModal(): void {
    this.openActivationCodeModal = false;
    this.activeForm.form.reset();
  }

  onActivateClick(): void {
    const me = this;
    if (!this.branch) return;
    this.loading = true;
    this.checkActivation$ = this.physicalCardsClient
      .checkActivation(this.branch.branchId, this.activateCode!)
      .subscribe({
        next(res: PhysicalCardActivation) {
          me.isScan = false;
          me.physicalCardActivation = res;
          if (res.status !== PhysicalCardActivationStatus.ReadyToActivate) {
            me.loading = false;
            me.stopActivationCode();
          } else me.continueActivationCode(res);
        },
        error: (error: ResponseErrorDto) => {
          me.isScan = false;
          me.loading = false;
          if (error.message?.includes("Product does not found")) {
            this.message = error.message;
            this.isOpenAlert = true;
            this.message = "Product does not found.";
          } else throw Error(error.message);
        },
      });
  }
  stopActivationCode(): void {
    this.isOpenAlert = true;
    this.message = "Serial number not ready to active.";
  }
  continueActivationCode(data: PhysicalCardActivation): void {
    const me = this;
    this.getProducts$ = this.productsClient
      .getProducts(
        this.branch!.branchId,
        false,
        null,
        String(data.product.productId)
      )
      .subscribe({
        next(res: CategoryProduct) {
          me.loading = false;
          me.product = res;

          if (
            res.categories?.length == 0 ||
            (res.categories && res.categories[0].productBuyPrices.length == 0)
          ) {
            me.isOpenAlert = true;
            me.message = "This product is not in your price list.";
          } else me.openActivationCodeModal = true;
        },
        error: (error: ResponseErrorDto) => {
          me.loading = false;
          throw Error(error.message);
        },
      });
  }
  onActivationCode(data: ActivateDto): void {
    this.activeForm.form.reset();
    const me = this;
    this.loading = true;
    this.placeActivatePhysicalCardOrder.init({
      serialNumber: data.serialNumber,
      productPrice: data.productPrice,
      withExchange: data.withExchange,
      buyPrice: data.buyPrice,
    });
    this.activate$ = this.physicalCardsClient
      .activate(this.branch!.branchId, this.placeActivatePhysicalCardOrder)
      .subscribe({
        next() {
          me.loading = false;
          me.notificationService.showSuccessNotification(
            "Physical card has been activated."
          );
        },
        error: (error: ResponseErrorDto) => {
          me.loading = false;
          if (error.typeName === dictionary.InsufficientBalanceException) {
            this.exchangeService.onInsufficientBalanceException(error);
          } else if (
            error.typeName === dictionary.WalletInsufficientBalanceException
          ) {
            const product: ExchangeProduct = {
              currency: data.currency!,
              totalPrice: data.totalPrice,
              unitBuyPrice: data.unitBuyPrice,
              unitFaceValuePrice: data.unitFaceValuePrice,
            };
            this.exchangeService.onWalletInsufficientBalanceException(
              product,
              error
            );
          } else if (
            error.typeName === dictionary.StockInsufficientBalanceException
          ) {
            this.exchangeService.onStockInsufficientBalanceException();
          } else {
            me.loading = false;
            throw Error(error.message);
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.checkActivation$.unsubscribe();
    this.getProducts$.unsubscribe();
    this.exchangeSubject$.unsubscribe();
  }
}
