// noinspection JSIgnoredPromiseFromCall,DuplicatedCode,ES6MissingAwait

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
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
  BuyOrdersClient,
  PlaceDigitalCardOrderRequest,
  PriceInvoice,
  ProductsClient,
} from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";
import { Platform } from "@ionic/angular";
import { Subscription } from "rxjs";
import { ICheckout, ReceiveFormType } from "../../dto/e-gift.dto";

@Component({
  selector: "app-checkout",
  templateUrl: "./checkout.component.html",
  styleUrls: ["./checkout.component.scss"],
})
export class CheckoutComponent implements OnInit {
  dictionary = dictionary;
  localImageSRC = "../../../../../assets/img/placeholder.jpg";
  openReceiveModal = false;
  receiveType: ReceiveFormType = "Sms";
  receiveModalHeight = 0;
  openProductBarcodeModal = false;
  branchId: number | undefined;
  textInsufficientErrorAlert: string | undefined;
  showInsufficientErrorAlert = false;
  getCurrencies$ = new Subscription();
  currencies: Currency[] = [];
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
  getProductInvoice$ = new Subscription();
  order = new PlaceDigitalCardOrderRequest();
  merchantId: number;
  exchangeSubject$ = new Subscription();
  openOrderStateErrorAlert = false;
  placeOrder$ = new Subscription();
  productCodes$ = new Subscription();
  printError$ = new Subscription();
  printSuccess$ = new Subscription();
  getBuy$ = new Subscription();
  openSetPinModal = false;

  @Input() isOpen = false;
  @Input() data!: ICheckout;

  @Output() dismiss = new EventEmitter();

  constructor(
    private platform: Platform,
    private ordersClient: BuyOrdersClient,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private coreService: CoreService,
    private currenciesClient: CurrenciesClient,
    private productsClient: ProductsClient,
    private exchangeService: ExchangeService
  ) {
    this.platform.ready().then(() => {
      this.receiveModalHeight = 200 / this.platform.height();
    });

    this.branchId = this.coreService.getBranchId();
    this.merchantId = coreService.getMerchantId(
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

  onReceiveClick(type: ReceiveFormType): void {
    this.receiveType = type;
    if (type === "download") {
      const placeOrderRequest = new PlaceDigitalCardOrderRequest();
      placeOrderRequest.quantity = this.data.quantity;
      placeOrderRequest.productPrice = this.data.faceValuePrice;
      placeOrderRequest.productId = this.data.product.productId!;
      placeOrderRequest.buyPrice = this.data.unitPrice;
      placeOrderRequest.withExchange = false;
      this.placeOrder(placeOrderRequest);
    } else this.openReceiveModal = true;
  }

  placeOrder(data: PlaceDigitalCardOrderRequest): void {
    this.order.init(data);
    this.loadingService.present();
    this.ordersClient.placeOrder(this.branchId!, data).subscribe({
      next: (res: number) => {
        setTimeout(() => {
          this.notificationService.showSuccessNotification(
            `order "${res}" created successfully`
          );
          this.returnToShop();
        }, 3000);
      },
      error: async (error: ResponseErrorDto) => {
        this.loadingService.dismiss();
        if (error.typeName === dictionary.InsufficientBalanceException) {
          this.exchangeService.onInsufficientBalanceException(error);
        } else if (
          error.typeName === dictionary.WalletInsufficientBalanceException
        ) {
          const product: ExchangeProduct = {
            currency: this.data.product.currency,
            totalPrice: this.data.totalPrice,
            unitBuyPrice: this.data.unitPrice,
            unitFaceValuePrice: this.data.product.faceValue.start,
          };
          this.exchangeService.onWalletInsufficientBalanceException(
            product,
            error
          );
        } else if (
          error.typeName === dictionary.StockInsufficientBalanceException
        ) {
          this.exchangeService.onStockInsufficientBalanceException();
        } else if (error.typeName === dictionary.NeedToActive2FaException) {
          this.notificationService.showErrorAlertNotification(
            "Your 2FA verification is not enabled.",
            "2FA is inactive."
          );
        } else if (error.typeName === dictionary.NeedToPinException) {
          this.openSetPinModal = true;
        } else if (error.typeName === dictionary.InvalidPinException) {
          this.notificationService.showErrorAlertNotification("wrong pin");
        } else {
          this.loadingService.dismiss();
          throw Error(error.message);
        }
      },
    });
  }

  onSetPin(pin: string): void {
    this.openSetPinModal = false;
    this.order.pin = pin;
    this.placeOrder(this.order);
  }

  returnToShop() {
    setTimeout(() => {
      location.href = `branches/${this.branchId}/eGift`;
    }, 500);
  }

  onBuyPriceMismatchExceptionContinueButtonAlertClick(): void {
    this.loadingService.present();
    this.getProductInvoice$ = this.productsClient
      .getProductInvoice(
        this.branchId!,
        this.data.product.productId!,
        this.order.productPrice
      )
      .subscribe({
        next: (res: PriceInvoice) => {
          this.loadingService.dismiss();
          this.data.unitPrice = res.sellAmount;
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  checkCurrencyEqual(): boolean {
    let currency = this.currencies.find((c) => c.currencyName === "USD");
    if (currency?.currencyId === this.data.product.currency.currencyId) {
      return true;
    } else {
      return false;
    }
  }

  onDismiss(): void {
    this.isOpen = false;
    this.getCurrencies$.unsubscribe();
    this.dismiss.emit();
    this.exchangeSubject$.unsubscribe();
  }
}
