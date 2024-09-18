import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LayoutService } from "@app/layout";
import { Branch } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { NotificationService } from "./notification.service";
import { AlertController } from "@ionic/angular";
import { ResponseErrorDto } from "../dto/core.dto";
import { Subject, Subscription } from "rxjs";
import {
  BuyOrdersClient,
  CategoryProduct,
  CurrenciesClient,
  CurrencyExchangeRate,
  ExchangeCalc,
} from "@app/proxy/shop-proxy";
import { LoadingService } from "./loading.service";
import { CoreService } from "./core.service";
import { ExchangeProduct } from "@app/modules/physical-gift-cards/dto/product.dto";
@Injectable({
  providedIn: "root",
})
export class ExchangeService {
  branchId: number | undefined;
  merchantId: number;
  totalPrice: number | undefined;
  product: ExchangeProduct | undefined;
  getExchangeRates$ = new Subscription();
  getExchangeCalc$ = new Subscription();
  activate$ = new Subscription();
  exchangeSubject = new Subject<ExchangeProduct>();

  constructor(
    private router: Router,
    private layoutService: LayoutService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private alertController: AlertController,
    private currenciesClient: CurrenciesClient,
    private loadingService: LoadingService,
    private buyOrdersClient: BuyOrdersClient,
    private coreService: CoreService
  ) {
    this.activatedRoute.params.subscribe((params) => {
      this.branchId = params["branchId"];
    });
    this.merchantId = this.coreService.getMerchantId(
      this.coreService.getBranchId()!
    )!;
  }

  async onInsufficientBalanceException(error: ResponseErrorDto) {
    const buttons = [
      {
        text: dictionary.Close,
        role: "cancel",
        cssClass: "info-alert-btn",
      },
    ];
    const walletInsufficientBalanceExceptionAlert =
      await this.alertController.create({
        subHeader: dictionary.InsufficientBalanceException,
        message: error.message,
        animated: false,
        cssClass: "deletePrice__alert",
        buttons: buttons,
      });
    await walletInsufficientBalanceExceptionAlert.present();
  }

  onWalletInsufficientBalanceException(
    product: ExchangeProduct,
    error?: ResponseErrorDto
  ): void {
    this.product = product;
    const dataToCheck = this.rateCurrency(product);
    this.getExchangeRates$ = this.currenciesClient
      .getExchangeRates()
      .subscribe({
        next: (res: CurrencyExchangeRate[]) => {
          const checkCurrencyEqual = this.isClientObjectExists(
            res,
            dataToCheck[0]
          );
          if (checkCurrencyEqual) this.getExchangeCalc();
          else this.showInsufficientBalanceAlert(error!);
        },
        error: (error) => {
          this.notificationService.showErrorAlertNotification(
            error.message ? error.message : "Internal server error"
          );
        },
      });
  }

  async onStockInsufficientBalanceException() {
    const buttons = [
      {
        text: dictionary.Close,
        role: "cancel",
        cssClass: "info-alert-btn",
      },
    ];
    const alert = await this.alertController.create({
      subHeader: dictionary.CanNotSubmitOrder,
      message: dictionary.StockInsufficientBalance,
      animated: false,
      cssClass: "deletePrice__alert",
      buttons: buttons,
    });
    await alert.present();
  }

  rateCurrency(product: any) {
    const baseCurrency =
      this.layoutService.branch?.merchant?.exchangeTargetCurrency;
    const selectedCurrency = product.currency;
    const convertedObject = {
      baseCurrency: {
        currencyId: selectedCurrency.currencyId,
        currencyName: selectedCurrency.currencyName,
      },
      targetCurrency: {
        currencyId: baseCurrency?.currencyId,
        currencyName: baseCurrency?.currencyName,
      },
    };
    return [convertedObject];
  }

  isClientObjectExists(exchangeRates: CurrencyExchangeRate[], data: any) {
    return exchangeRates.some(
      (obj) =>
        obj.baseCurrency.currencyId === data.baseCurrency.currencyId &&
        obj.targetCurrency.currencyId === data.targetCurrency.currencyId
    );
  }

  getExchangeCalc() {
    this.loadingService.present();
    this.getExchangeCalc$ = this.buyOrdersClient
      .getExchangeCalc(
        this.layoutService.branch?.branchId!,
        this.merchantId,
        this.product?.currency?.currencyId!,
        this.product?.totalPrice!
      )
      .subscribe({
        next: async (response: ExchangeCalc) => {
          this.loadingService.dismiss();
          this.showExchangeCalcAlert(response);
        },
        error: async (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          if (
            error.typeName === dictionary.WalletInsufficientBalanceException
          ) {
            this.showInsufficientBalanceAlert(error);
          } else {
            this.notificationService.showErrorAlertNotification(
              error.message ? error.message : "Internal server error"
            );
          }
        },
      });
  }

  async showExchangeCalcAlert(response: ExchangeCalc) {
    this.loadingService.dismiss();
    const walletInsufficientBalanceExceptionAlert =
      await this.alertController.create({
        header: dictionary.InsufficientBalance,
        message: `
      Please charge your account to continue shopping.<br /><br />
      Do you want to exchange from other currencies?<br /><br />
      <span class="gray-color">Exchange from</span> <b >${response.baseCurrency.currencyName}</b> <span class="gray-color">To</span> <b >${response.targetCurrency.currencyName}.</b><br />
      <span class="gray-color">Exchange Rate:</span> <b>${response.exchangeRate}</b><br />
      <span class="gray-color">Total amount:</span> <b>${response.targetAmount}</b> <b >(${response.targetCurrency.currencyName})</b><br />
      `,
        animated: false,
        cssClass: "deletePrice__alert",
        buttons: [
          {
            text: dictionary.Cancel,
            role: "cancel",
            cssClass: "info-alert-btn",
          },
          {
            text: dictionary.Confirm,
            role: "confirm",
            cssClass: "primary-alert-btn",
            handler: () => {
              this.onActivate();
            },
          },
        ],
      });
    await walletInsufficientBalanceExceptionAlert.present();
  }

  async showInsufficientBalanceAlert(error: ResponseErrorDto) {
    this.branchId = this.coreService.getBranchId()!;
    let message = ``;
    let buttons = [];
    const branch = this.layoutService.getBranch(this.branchId);
    if (
      branch?.canCreatePaymentOrder &&
      this.layoutService.getDeviceMode() === "desktop"
    ) {
      message = `
      ${error.message!} 
      <br />
      Do you want to charge wallet?
      `;
      buttons = [
        {
          text: dictionary.Cancel,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
        {
          text: dictionary.Charge,
          role: "confirm",
          cssClass: "primary-alert-btn",
          handler: () => {
            const url = `/branches/${this.branchId}/financial/peyments`;
            this.router.navigate([url]);
          },
        },
      ];
    } else {
      message = error.message!;
      buttons = [
        {
          text: dictionary.Close,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
      ];
    }

    const walletInsufficientBalanceExceptionAlert =
      await this.alertController.create({
        header: dictionary.InsufficientBalance,
        message: message,
        animated: false,
        cssClass: "deletePrice__alert",
        buttons: buttons,
      });
    await walletInsufficientBalanceExceptionAlert.present();
  }

  getMerchantName(): string {
    const branch = this.layoutService.branch;
    return branch?.branchName !== "root"
      ? `${branch?.merchant?.merchantName} (${branch?.branchName})`
      : `${branch?.merchant?.merchantName}`;
  }

  onActivate() {
    this.exchangeSubject.next(this.product!);
  }
}
