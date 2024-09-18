import { Component, OnInit, ViewChild } from "@angular/core";
import { LoadingService, NotificationService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  Branch,
  MerchantsClient,
  PatchOfBoolean,
  PatchOfInteger,
  UpdateMerchantRequest,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { AlertButton } from "@ionic/angular";
import { lastValueFrom } from "rxjs";
import { ILink } from "../../dto/settings.dto";

@Component({
  selector: "app-security-tab",
  templateUrl: "./security-tab.component.html",
  styleUrls: ["./security-tab.component.scss"],
})
export class SecurityTabComponent implements OnInit {
  dictionary = dictionary;
  links: ILink[] = [
    {
      name: dictionary.GoogleAuthenticatorAndroidApp,
      href: "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en",
    },
    {
      name: dictionary.GoogleAuthenticatoriOSApp,
      href: "https://apps.apple.com/us/app/google-authenticator/id388497605",
    },
  ];
  branchId: number;
  merchantId: number;
  branch: Branch;
  qrCodeLoading = true;
  isActive2Fa = false;
  qrCodeValue: string | undefined;
  code: string | undefined;
  isOpen = false;
  buttons: AlertButton[] = [];
  showQrCode: boolean = false;

  @ViewChild("twoFAVerifyForm") twoFAVerifyForm: any;

  constructor(
    private merchantsClient: MerchantsClient,
    private layoutService: LayoutService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {
    this.branchId = this.layoutService.branch!.branchId;
    this.merchantId = this.layoutService.branch!.merchantId;
    this.branch = this.layoutService.branch!;
  }

  ngOnInit() {
    this.isActive2Fa = this.branch.merchant!.isActive2Fa;
    this.showQrCode = !this.isActive2Fa
    this.initQrCodeValue();
  }

  async initQrCodeValue(): Promise<void> {
    try {
      this.qrCodeValue = await lastValueFrom(
        this.merchantsClient.generate2FaQrCode(this.branchId, this.merchantId)
      );
      this.qrCodeLoading = false;
    } catch (error: any) {
      this.qrCodeLoading = false;
      throw Error(error.message);
    }
  }

  async onActiveClick(): Promise<void> {
    try {
      this.loadingService.present();
      const request = new UpdateMerchantRequest();
      const otpCodeToActivate2Fa = new PatchOfInteger();
      otpCodeToActivate2Fa.init({
        value: this.code,
      });
      request.init({
        otpCodeToActivate2Fa: otpCodeToActivate2Fa,
      });
      const merchant = await lastValueFrom(
        this.merchantsClient.update(this.branchId, this.merchantId, request)
      );
      this.notificationService.showSuccessNotification(
        `Your 2FA verification is active now.`
      );
      this.isActive2Fa = true;
      this.showQrCode = false
      this.twoFAVerifyForm.form.reset();
      this.branch.merchant = merchant;
      this.layoutService.updateBranch(this.branch);
      this.loadingService.dismiss();
    } catch (error: any) {
      this.loadingService.dismiss();
      if (error.typeName === "Invalid2FaException") {
        this.notificationService.showErrorAlertNotification(
          "Your authentication code is wrong, Please try again.",
          "2FA is incorrect."
        );
      }else{
        this.notificationService.showErrorAlertNotification(error.message);
      }
    }
  }

  onInactiveClick(): void {
    const me = this;
    this.isOpen = true;
    this.buttons = [
      {
        text: dictionary.Cancel,
        role: "cancel",
        handler() {
          me.isOpen = false;
        },
      },
      {
        text: dictionary.Inactive,
        role: "destructive",
        handler() {
          const request = new UpdateMerchantRequest();
          const inactivate2Fa = new PatchOfBoolean();
          inactivate2Fa.init({
            value: true,
          });
          request.init({
            inactivate2Fa: inactivate2Fa,
          });
          me.inactiveCode(request);
          me.isOpen = false;
        },
      },
    ];
  }
  async inactiveCode(data: UpdateMerchantRequest): Promise<void> {
    try {
      this.loadingService.present();
      const merchant = await lastValueFrom(
        this.merchantsClient.update(this.branchId, this.merchantId, data)
      );
      this.notificationService.showSuccessNotification(
        `Your 2FA verification is inactive now.`
      );
      this.isActive2Fa = false;
      this.branch.merchant = merchant;
      this.layoutService.updateBranch(this.branch);
      this.loadingService.dismiss();
    } catch (error: any) {
      this.loadingService.dismiss();
      throw Error(error.message);
    }
  }
}
