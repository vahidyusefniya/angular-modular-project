import { Component, OnInit } from "@angular/core";
import { LoadingService, NotificationService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  MerchantsClient,
  PatchOfBoolean,
  UpdateMerchantRequest,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { AlertButton } from "@ionic/angular";
import { lastValueFrom } from "rxjs";

@Component({
  selector: "app-company-configuration-tab",
  templateUrl: "./company-configuration-tab.component.html",
  styleUrls: ["./company-configuration-tab.component.scss"],
})
export class CompanyConfigurationTabComponent implements OnInit {
  dictionary = dictionary;
  pinRequired = false;
  isOpen = false;
  message: string | undefined;
  header: string | undefined;
  buttons: AlertButton[] = [];
  branchId: number;
  merchantId: number;

  constructor(
    private merchantsClient: MerchantsClient,
    private layoutService: LayoutService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {
    this.branchId = this.layoutService.branch!.branchId;
    this.merchantId = this.layoutService.branch!.merchantId;
  }

  ngOnInit() {
    this.pinRequired = this.layoutService.branch?.merchant?.isActivePin!;
  }

  onPinToggleClick(event: Event): void {
    event.stopImmediatePropagation();
    const me = this;
    this.isOpen = true;
    if (this.pinRequired) {
      this.header = dictionary.InactivePin;
      this.message = "Are you sure inactive pin";
      this.buttons = [
        {
          text: dictionary.Cancel,
          role: "cancel",
          handler() {
            me.isOpen = false;
          },
        },
        {
          text: dictionary.Inactivate,
          role: "destructive",
          handler() {
            const data = new UpdateMerchantRequest();
            const activatePin = new PatchOfBoolean();
            activatePin.init({
              value: false,
            });
            data.init({
              activatePin: activatePin,
            });
            me.updateMerchant(data);
            me.isOpen = false;
          },
        },
      ];
    } else {
      this.header = dictionary.ActivePin;
      this.message = "Are you sure active pin";
      this.buttons = [
        {
          text: dictionary.Cancel,
          role: "cancel",
          handler() {
            me.isOpen = false;
          },
        },
        {
          text: dictionary.Activate,
          role: "destructive",
          handler() {
            const data = new UpdateMerchantRequest();
            const activatePin = new PatchOfBoolean();
            activatePin.init({
              value: true,
            });
            data.init({
              activatePin: activatePin,
            });
            me.updateMerchant(data);
            me.isOpen = false;
          },
        },
      ];
    }
  }
  async updateMerchant(data: UpdateMerchantRequest): Promise<void> {
    try {
      this.loadingService.present();
      const merchant = await lastValueFrom(
        this.merchantsClient.update(this.branchId, this.merchantId, data)
      );
      this.pinRequired = merchant.isActivePin;
      let branch = this.layoutService.branch;
      branch?.merchant?.init(merchant);
      this.layoutService.updateBranch(branch);
      this.loadingService.dismiss();
      this.notificationService.showSuccessNotification("Pin status updated.");
    } catch (error: any) {
      this.loadingService.dismiss();
      throw Error(error.message);
    }
  }
}
