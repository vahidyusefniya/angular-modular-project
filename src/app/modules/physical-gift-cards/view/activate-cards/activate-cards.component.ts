import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  ExchangeService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { IButtonFaceValue } from "@app/modules/activate/dto/activate.dto";
import {
  CategoryProduct,
  PhysicalCardActivation,
  PhysicalCardsClient,
  PlaceActivatePhysicalCardOrderRequest,
  ProductBuyPrice,
  ProductsClient,
} from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";
import { AlertController } from "@ionic/angular";
import { Subscription } from "rxjs";
import { ExchangeProduct } from "../../dto/product.dto";

@Component({
  selector: "app-activate-cards",
  templateUrl: "./activate-cards.component.html",
  styleUrls: ["./activate-cards.component.scss"],
})
export class ActivateCardsComponent implements OnInit {
  dictionary = dictionary;
  activateCode: string = "";
  checkActivate$: Subscription = new Subscription();
  activate$: Subscription = new Subscription();
  branchId: number;
  card: PhysicalCardActivation | undefined;
  faceValues: IButtonFaceValue[] = [];
  activeFaceValue: IButtonFaceValue | undefined;
  productBuyPrice: ProductBuyPrice | undefined;
  buttonFaceValues: IButtonFaceValue[] = [];
  showConfirmModal: boolean = false;
  showRangeForm: boolean = false;
  products: ExchangeProduct[] = [];
  showInsufficientErrorAlert = false;
  textInsufficientErrorAlert: string | undefined = "";
  showBuyPriceMismatchExceptionAlert = false;
  textBuyPriceMismatchExceptionAlert: string | undefined;
  merchantId: number;
  totalPrice = 0;
  getProductInvoice$ = new Subscription();
  unitPrice = 0;
  product: ExchangeProduct | undefined;

  errorAlertButtons = [
    {
      text: dictionary.Cancel,
      role: "cancel",
      handler: () => {
        this.showInsufficientErrorAlert = false;
      },
    },
  ];

  @ViewChild("checkForm") checkForm!: NgForm;

  constructor(
    private coreService: CoreService,
    private loadingService: LoadingService,
    private physicalCards: PhysicalCardsClient,
    private productsClient: ProductsClient,
    private alertController: AlertController,
    private notificationService: NotificationService,
    private exchangeService: ExchangeService
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.merchantId = coreService.getMerchantId(
      this.coreService.getBranchId()!
    )!;

    this.exchangeService.exchangeSubject.subscribe((response: any) => {
      this.loadingService.present();
      const placeActivatePhysicalCardOrderRequest =
        new PlaceActivatePhysicalCardOrderRequest({
          serialNumber: this.activateCode,
          productPrice: response.unitFaceValuePrice,
          withExchange: true,
          buyPrice: response.unitBuyPrice,
        });

      this.activate$ = this.physicalCards
        .activate(this.branchId, placeActivatePhysicalCardOrderRequest)
        .subscribe({
          next: (response) => {
            this.checkForm.reset();
            this.showConfirmModal = false;
            this.showRangeForm = false;
            this.card = undefined;
            this.notificationService.showSuccessNotification(
              "Serial number activated."
            );
            this.loadingService.dismiss();
          },
        });
    });
  }

  ngOnInit() {}

  validateNumberInput(event: any) {
    this.coreService.checkNumberInput(event);
  }

  watchBarcode() {
    this.card = undefined;
  }

  checkActivate() {
    this.loadingService.present();
    this.checkActivate$ = this.physicalCards
      .checkActivation(this.branchId, this.activateCode)
      .subscribe({
        next: async (data: PhysicalCardActivation) => {
          if (data.status === "ReadyToActivate") {
            this.checkActivate$ = this.productsClient
              .getProducts(
                this.branchId,
                false,
                null,
                String(data.product.productId)
              )
              .subscribe({
                next: async (response) => {
                  if (response.categories?.length == 0) {
                    const alert = await this.alertController.create({
                      header: dictionary.CantBeActivated,
                      message: dictionary.ProductIsNotPriceList,
                      animated: false,
                      buttons: [
                        {
                          text: dictionary.Cancel,
                          role: "cancel",
                          cssClass: "info-alert-btn",
                        },
                      ],
                    });

                    await alert.present();
                    this.card = undefined;
                  } else {
                    this.card = data;
                    let temp = this.getFirstItem(response.categories!);
                    this.productBuyPrice = temp.productBuyPrices[0];
                    this.buttonFaceValues = this.fillButtonFaceValues(
                      temp.productBuyPrices[0]
                    );
                    this.buttonFaceValues = this.convertButtonFaceValues(
                      this.buttonFaceValues
                    );

                    this.faceValues = this.buttonFaceValues;
                  }
                  this.loadingService.dismiss();
                },
                error: (error: ResponseErrorDto) => {
                  this.loadingService.dismiss();
                  throw Error(error.message);
                },
              });
          } else {
            const alert = await this.alertController.create({
              header: dictionary.CantBeActivated,
              message: dictionary.SerialNumberNotReadyToActive,
              animated: false,
              buttons: [
                {
                  text: dictionary.Cancel,
                  role: "cancel",
                  cssClass: "info-alert-btn",
                },
              ],
            });
            this.loadingService.dismiss();
            await alert.present();
          }
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  fillButtonFaceValues(productBuyPrices: ProductBuyPrice): IButtonFaceValue[] {
    let i = 0;
    const buttonFaceValues: any = productBuyPrices.faceValues?.map((item) => ({
      endValue: item.endValue,
      faceValue: item.faceValue,
      isEndless: item.isEndless,
      start: item.start,
      end: item.end,
    }));

    return buttonFaceValues;
  }
  convertButtonFaceValues(data: IButtonFaceValue[]): IButtonFaceValue[] {
    const buttons: IButtonFaceValue[] = [];
    data.forEach((value) => {
      if (buttons.length == 0) {
        buttons.push(value);
      } else {
        if (value.start && value.end) {
          const index = buttons.findIndex(
            (b) => b.faceValue == value.faceValue
          );

          if (index != -1) {
            buttons[index] = {
              currency: buttons[index].currency,
              end:
                buttons[index].end! > value.end
                  ? buttons[index].end
                  : value.end,
              start:
                buttons[index].start! < value.start
                  ? buttons[index].start
                  : value.start,
              endValue: buttons[index].endValue,
              faceValue: buttons[index].faceValue,
              fill: buttons[index].fill,
              id: buttons[index].id,
              isEndless: buttons[index].isEndless,
            };
          } else {
            buttons.push(value);
          }
        } else {
          buttons.push(value);
        }
      }
    });

    return buttons;
  }

  chooseFaceValue(activeFaceValue: IButtonFaceValue) {
    this.activeFaceValue = activeFaceValue;
    if (this.activeFaceValue?.end === null) {
      this.getProductInvoice();
    } else {
      this.showRangeForm = true;
    }
  }

  getProductInvoice() {
    this.loadingService.present();
    this.checkActivate$ = this.productsClient
      .getProductInvoice(
        this.branchId,
        this.card?.product?.productId!,
        this.activeFaceValue?.start!
      )
      .subscribe({
        next: (response) => {
          this.showConfirmModal = true;
          this.product = {
            ...this.card?.product!,
            unitFaceValuePrice: this.activeFaceValue?.start,
            currency: this.productBuyPrice?.currency!,
            unitBuyPrice: response.sellAmount,
            totalPrice: response.buyAmount,
          };
          this.products = [];
          this.products.push(this.product!);
          this.loadingService.dismiss();
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }
  setActiveFaceValueStart(start: number | undefined) {
    this.activeFaceValue!.start = start!;
    this.getProductInvoice();
  }

  getFirstItem(categories: CategoryProduct[]) {
    return categories[0]!;
  }

  confirm() {
    this.loadingService.present();
    const placeActivatePhysicalCardOrderRequest =
      new PlaceActivatePhysicalCardOrderRequest({
        serialNumber: this.activateCode,
        productPrice: this.activeFaceValue?.start!,
        withExchange: false,
        buyPrice: this.products[0]?.unitBuyPrice!,
      });

    this.activate$ = this.physicalCards
      .activate(this.branchId, placeActivatePhysicalCardOrderRequest)
      .subscribe({
        next: (response) => {
          this.checkForm.reset();
          this.showConfirmModal = false;
          this.showRangeForm = false;
          this.card = undefined;
          this.notificationService.showSuccessNotification(
            "Serial number activated."
          );
          this.loadingService.dismiss();
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          if (error.typeName === dictionary.InsufficientBalanceException) {
            this.exchangeService.onInsufficientBalanceException(error);
          } else if (
            error.typeName === dictionary.WalletInsufficientBalanceException
          ) {
            this.exchangeService.onWalletInsufficientBalanceException(
              this.products[0],
              error
            );
          } else if (
            error.typeName === dictionary.StockInsufficientBalanceException
          ) {
            this.exchangeService.onStockInsufficientBalanceException();
          } else {
            this.notificationService.showErrorAlertNotification(
              error.message ? error.message : "Internal server error"
            );
          }
        },
      });
  }
}
