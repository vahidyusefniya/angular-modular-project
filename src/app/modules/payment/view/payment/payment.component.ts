// noinspection JSIgnoredPromiseFromCall
import { HttpClient } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import {
  Branch,
  CreateChargeAutoPaymentOrderRequest,
  CreateChargeOrdinaryPaymentOrderRequest,
  GatewayListsClient,
  PaymentOrdersClient,
  PaymentProfile,
  PaymentProviderClient,
  PaymentProviderCustomerPanelLinkAccessType,
  PaymentProviderPaymentMethod,
  PaymentProviderPaymentMethodType,
  PaymentProviderProfile,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { forkJoin, map, Observable, of, Subscription, switchMap } from "rxjs";
import { IPaymentMethodsDto, IPaymentProfilesDto } from "../../dto/payment.dto";
import { LayoutService } from "@app/layout";
import { Router } from "@angular/router";

// interface IPayment {
//   id: number;
//   title: string;
//   icon: string;
//   description: string;
// }

@Component({
  selector: "app-invoices",
  templateUrl: "./payment.component.html",
  styleUrls: ["./payment.component.scss"],
})
export class PaymentComponent implements OnInit {
  dictionary = dictionary;
  showModal: boolean = false;
  showBankTransferModal: boolean = false;
  showRedeemModal: boolean = false;
  showChequeModal: boolean = false;
  paymentProfiles: IPaymentProfilesDto[] = [];
  payment: IPaymentProfilesDto | undefined;
  getPaymentProfilesSub$ = new Subscription();
  branchId: number;
  isDark = false;
  icon: string = "";
  selectedBranch: Branch | undefined;
  branches: Branch[] = [];
  getPaymentMethodSub$ = new Subscription();
  getCustomerPanelLinkSub$ = new Subscription();
  showAchModal = false;
  paymentMethodsProfile: IPaymentMethodsDto[] = [];

  constructor(
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private gatewayListsClient: GatewayListsClient,
    private coreService: CoreService,
    private http: HttpClient,
    private paymentOrdersClient: PaymentOrdersClient,
    private layoutService: LayoutService,
    private router: Router,
    private paymentProviderClient: PaymentProviderClient
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.branches = this.layoutService.branches;
    this.isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  ngOnInit() {
    this.selectedBranch = this.branches.find(
      (b) => b.branchId == this.branchId
    );
    if (!this.selectedBranch?.canCreatePaymentOrder) {
      this.router.navigate([`/branches/${this.branchId}/price-lists`]);
    }
    this.getPaymentProfiles();
  }

  getPaymentProfiles(): void {
    this.loadingService.present();
    this.getPaymentProfilesSub$ = this.gatewayListsClient
      .getPaymentProfiles(this.branchId)
      .pipe(
        switchMap((payments) => {
          return this.preloadIcons(payments).pipe(
            map((icons) => ({ payments, icons }))
          );
        })
      )
      .subscribe({
        next: ({ payments, icons }) => {
          this.paymentProfiles = payments.map((item) => {
            const iconUri = item.imageUri1;
            return {
              paymentProfileId: item.paymentProfileId,
              paymentProfileName: item.name,
              providerIcon: icons[iconUri!],
              maxAmount: item.maxAmount,
              minAmount: item.minAmount,
              description: item.description,
              currencyName: item.currency.currencyName,
              currencyId: item.currency.currencyId,
              symbol: item.currency.symbol!,
              hasAutoPayment: item.hasAutoPayment,
              providerProfileId: item.providerProfileId!,
            };
          });
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
        complete: () => {
          this.loadingService.dismiss();
        },
      });
  }

  preloadIcons(
    payments: PaymentProfile[]
  ): Observable<{ [key: string]: string }> {
    const iconRequests = payments.map((payment) => {
      const iconUri = payment.imageUri1;
      if (!iconUri) {
        return of({ uri: "", content: "" });
      }
      if (iconUri.includes(".svg")) {
        return this.getSvgContent(iconUri).pipe(
          map((svgContent) => ({
            uri: iconUri,
            content: "data:image/svg+xml;base64," + btoa(svgContent),
          }))
        );
      } else {
        return of({ uri: iconUri, content: iconUri });
      }
    });

    return forkJoin(iconRequests).pipe(
      map((results) =>
        results.reduce((acc, curr) => {
          if (curr.uri) {
            acc[curr.uri] = curr.content;
          }
          return acc;
        }, {} as { [key: string]: string })
      )
    );
  }

  getSvgContent(svgPath: string): Observable<string> {
    return this.http.get(svgPath, {
      responseType: "text",
    });
  }

  showPaymentDetailModal(payment: IPaymentProfilesDto): void {
    this.payment = payment;
    this.icon = payment.providerIcon!;
    if (
      payment.paymentProfileName === "ACH" ||
      payment.paymentProfileName === "CHASE"
    ) {
      this.onAchClick(payment.paymentProfileName);
    } else {
      this.showModal = true;
    }
  }

  redirectTo(link: string): void {
    window.open(link, "_blank");
  }

  createPaymentOrder(data: CreateChargeOrdinaryPaymentOrderRequest): void {
    this.loadingService.present();
    this.paymentOrdersClient.ordinary(this.branchId, data).subscribe({
      next: (response) => {
        this.notificationService.showSuccessNotification(
          dictionary.textMessageNotifAfterCreatePayment
        );
        this.loadingService.dismiss();
        window.location.href = response.paymentUrl!;
      },
      error: (error: ResponseErrorDto) => {
        this.notificationService.showErrorAlertNotification(error.message!);
        this.loadingService.dismiss();
      },
    });
  }

  createPaymentOrderAuto (data: CreateChargeAutoPaymentOrderRequest) {
    this.loadingService.present();
    let createChargeAutoPaymentOrderRequest = new CreateChargeAutoPaymentOrderRequest({
      amount: data.amount,
      paymentMethodProviderProfileId: data.paymentMethodProviderProfileId
    })

    this.paymentOrdersClient.auto(this.branchId, createChargeAutoPaymentOrderRequest).subscribe({
      next: (response) => {
        this.notificationService.showSuccessNotification(
          `Your wallet ${this.payment?.symbol}${data.amount} charge.`
        );
        this.router.navigate([`/branches/${this.branchId}/financial/peyments`]);
        this.loadingService.dismiss();
      },
      error: (error: ResponseErrorDto) => {
        this.notificationService.showErrorAlertNotification(error.message!);
        this.loadingService.dismiss();
      },
    });
  }
  onAchClick(paymentProfileName: string): void {
    this.loadingService.present();
    this.getPaymentMethodSub$ = this.paymentProviderClient
      .getMerchantPaymentMethods(
        this.branchId,
        this.selectedBranch?.merchantId!
      )
      .subscribe({
        next: (response) => {
          this.loadingService.dismiss();
          this.fillPaymentMethodProfile(response, paymentProfileName);
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }
  fillPaymentMethodProfile(
    response: PaymentProviderPaymentMethod[],
    paymentProfileName: string
  ) {
    const paymentMethodType =
      paymentProfileName === "ACH"
        ? PaymentProviderPaymentMethodType.ElectronicCheck
        : PaymentProviderPaymentMethodType.CreditCard;

    const hasPaymentMethod = response.some(
      (provider) => provider.paymentMethodType === paymentMethodType
    );

    if (!hasPaymentMethod) {
      this.redirectCustomerPanelLink(paymentProfileName);
    } else {
      this.paymentMethodsProfile = response
        .filter((item) => item.paymentMethodType === paymentMethodType)
        .map((item) => ({
          paymentMethodId: item.paymentMethodId,
          paymentMethodNumber: item.paymentMethodNumber,
          paymentMethodType: item.paymentMethodType,
          paymentMethodTypeId: item.paymentMethodId,
          paymentMethodProviderProfileId:
            item.providerProfiles![0].paymentMethodProviderProfileId,
          profileId: item.providerProfiles![0].profileId,
          profileName: item.providerProfiles![0].profileName,
        }));
      this.showAchModal = true;
    }
  }

  redirectCustomerPanelLink(paymentProfileName: string): void {
    this.loadingService.present();
    const paymentMethodType =
      paymentProfileName === "ACH"
        ? PaymentProviderCustomerPanelLinkAccessType.ElectronicCheck
        : PaymentProviderCustomerPanelLinkAccessType.CreditCard;
    this.getCustomerPanelLinkSub$ = this.paymentProviderClient
      .getCustomerPanelLink(
        this.branchId,
        this.selectedBranch?.merchantId!,
        paymentMethodType
      )
      .subscribe({
        next: (response) => {
          this.loadingService.dismiss();
          window.location.href = response;
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  ngOnDestroy(): void {
    this.getPaymentMethodSub$.unsubscribe();
  }
}
