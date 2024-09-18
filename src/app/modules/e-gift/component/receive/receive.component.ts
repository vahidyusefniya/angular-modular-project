// noinspection JSIgnoredPromiseFromCall

import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  ExchangeService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { ExchangeProduct } from "@app/modules/physical-gift-cards/dto/product.dto";
import { CurrenciesClient, Currency } from "@app/proxy/proxy";
import {
  BuyOrderDeliveryType,
  BuyOrdersClient,
  PlaceDigitalCardOrderRequest,
  PriceInvoice,
  ProductsClient,
} from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";
import { IonInput, IonModal } from "@ionic/angular";
import { Subscription } from "rxjs";
import { ReceiveFormType } from "../../dto/e-gift.dto";

@Component({
  selector: "app-receive",
  templateUrl: "./receive.component.html",
  styleUrls: ["./receive.component.scss"],
})
export class ReceiveComponent implements OnInit, AfterViewInit, OnDestroy {
  dictionary = dictionary;
  receive: string | undefined;
  confirmReceive: string = "";
  branchId: number | undefined;
  merchantId: number;
  currencies: Currency[] = [];
  getCurrencies$ = new Subscription();
  getProductInvoice$ = new Subscription();
  textInsufficientErrorAlert: string | undefined;
  showInsufficientErrorAlert = false;
  step: number = 1;
  errorAlertButtons = [
    {
      text: dictionary.Cancel,
      role: "cancel",
      handler: () => {
        this.showInsufficientErrorAlert = false;
      },
    },
  ];
  showBuyPriceMismatchExceptionAlert = false;
  buyPriceMismatchExceptionButtons = [
    {
      text: dictionary.Cancel,
      role: "cancel",
      handler: () => {
        this.showBuyPriceMismatchExceptionAlert = false;
      },
    },
    {
      text: dictionary.Continue,
      handler: () => {
        this.showBuyPriceMismatchExceptionAlert = false;
        this.onBuyPriceMismatchExceptionContinueButtonAlertClick();
      },
    },
  ];
  textBuyPriceMismatchExceptionAlert: string | undefined;
  exchangeSubject$ = new Subscription();
  order = new PlaceDigitalCardOrderRequest();

  @Input() isOpen = false;
  @Input() type: ReceiveFormType = "Sms";
  @Input() productName: string | undefined;
  @Input() total: number | undefined;
  @Input() modalHeight = 0;
  @Input() productId = 0;
  @Input() quantity: number | undefined;
  @Input() productPrice: number | undefined;
  @Input() currencyId: number | undefined;
  @Input() currencyName: string | undefined;
  @Input() unitPrice: number | undefined;

  @ViewChild("receiveInput") receiveInput!: IonInput;
  @ViewChild("emailInput") emailInput!: IonInput;
  @ViewChild("receiveModal") receiveModal!: IonModal;

  @Output() dismiss = new EventEmitter();

  constructor(
    private ordersClient: BuyOrdersClient,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private coreService: CoreService,
    private currenciesClient: CurrenciesClient,
    private productsClient: ProductsClient,
    private exchangeService: ExchangeService
  ) {
    this.branchId = this.coreService.getBranchId();
    this.merchantId = this.coreService.getMerchantId(
      this.coreService.getBranchId()!
    )!;
    this.exchangeSubject$ = this.exchangeService.exchangeSubject.subscribe(
      () => {
        this.order.withExchange = true;
        this.placeOrder(this.order);
      }
    );
  }

  ngOnInit() {
    this.getCurrencies();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.receiveInput) {
        this.receiveInput.setFocus();
      }
      if (this.emailInput) {
        this.emailInput.setFocus();
      }
    }, 200);
  }

  onDismiss(): void {
    this.isOpen = false;
    this.dismiss.emit();
    this.receiveModal.dismiss();
  }

  previousStep() {
    this.step = 1;
    this.confirmReceive = "";
  }

  nextStep() {
    this.loadingService.present();
    setTimeout(() => {
      this.step = 2;
      this.loadingService.dismiss();
    }, 1000);
  }

  onReceiveClick(): void {
    this.order.quantity = this.quantity!;
    this.order.productPrice = this.productPrice!;
    this.order.productId = this.productId;
    switch (this.type) {
      case BuyOrderDeliveryType.Email:
        this.order.deliveryType = BuyOrderDeliveryType.Email;
        break;
      case BuyOrderDeliveryType.Sms:
        this.order.deliveryType = BuyOrderDeliveryType.Sms;
        break;
      case BuyOrderDeliveryType.WhatsApp:
        this.order.deliveryType = BuyOrderDeliveryType.WhatsApp;
        break;
      default:
        this.order.deliveryType = null;
    }
    this.order.deliveryTypeValue = String(this.receive);
    this.order.withExchange = false;
    this.order.buyPrice = this.total!;
    this.placeOrder(this.order);
  }

  onBuyPriceMismatchExceptionContinueButtonAlertClick(): void {
    this.loadingService.present();
    this.getProductInvoice$ = this.productsClient
      .getProductInvoice(this.branchId!, this.productId!, this.productPrice!)
      .subscribe({
        next: (res: PriceInvoice) => {
          this.loadingService.dismiss();
          this.unitPrice = res.sellAmount;
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  getCurrencies(): void {
    this.getCurrencies$ = this.currenciesClient.getCurrencies().subscribe({
      next: (res) => {
        this.currencies = res;
      },
      error: (error: ResponseErrorDto) => {
        throw Error(error.message);
      },
    });
  }

  returnToShop() {
    setTimeout(() => {
      location.href = `branches/${this.branchId}/eGift`;
    }, 500);
  }

  placeOrder(data: PlaceDigitalCardOrderRequest): void {
    this.loadingService.present();
    this.ordersClient.placeOrder(this.branchId!, data).subscribe({
      next: (res: number) => {
        this.notificationService.showSuccessNotification(
          `order "${res}" created successfully`
        );
        this.returnToShop();
      },
      error: async (error: ResponseErrorDto) => {
        this.loadingService.dismiss();
        if (error.typeName === dictionary.InsufficientBalanceException) {
          this.exchangeService.onInsufficientBalanceException(error);
        } else if (
          error.typeName === dictionary.WalletInsufficientBalanceException
        ) {
          const currency = new Currency();
          currency.init({
            currencyId: this.currencyId,
            currencyName: this.currencyName,
          });
          const product: ExchangeProduct = {
            currency: currency,
            totalPrice: this.total,
            unitBuyPrice: this.productPrice,
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
          this.loadingService.dismiss();
          throw Error(error.message);
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.getCurrencies$.unsubscribe();
    this.getProductInvoice$.unsubscribe();
    this.exchangeSubject$.unsubscribe();
  }
}
