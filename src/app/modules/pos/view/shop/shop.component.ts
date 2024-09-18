import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  CreatePosOrderRequest,
  CreatePosRequest,
  Pos,
  PosOrderPaymentMethod,
  PosOrdersClient,
  PosesClient,
  UpdatePosRequest,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { AlertController } from "@ionic/angular";
import { combineLatest, Subscription } from "rxjs";

@Component({
  selector: "app-shop",
  templateUrl: "./shop.component.html",
  styleUrls: ["./shop.component.scss"],
})
export class ShopComponent implements OnInit {
  dictionary = dictionary;
  initPage$ = new Subscription();
  loading: boolean = false;
  branchId: number;
  showProductDetail: boolean = false;
  poses: Pos[] = [];
  pos: Pos | undefined;
  posOrderPaymentMethod = PosOrderPaymentMethod;
  constructor(
    private coreService: CoreService,
    private posesClient: PosesClient,
    private posOrdersClient: PosOrdersClient,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private layoutService: LayoutService,
    private alertController: AlertController,
    private router: Router
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.layoutService.checkPagePermission("BuyablePosRead");
  }

  ngOnInit() {
    this.initPage();
  }

  initPage(): void {
    this.loading = true;
    this.loadingService.present();
    this.initPage$ = this.posesClient.getPoses(-1).subscribe({
      next: (res) => {
        this.loading = false;
        this.poses = res;
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        this.loadingService.dismiss();
        throw Error(error.message);
      },
      complete: () => {
        this.loadingService.dismiss();
      },
    });
  }

  onShowProductDetail(pos: Pos) {
    this.pos = pos;
    this.showProductDetail = true;
  }

  onBuyClick(model: CreatePosOrderRequest) {
    this.loadingService.present();
    model.posId = this.pos?.posId!;
    model.returnUri =
      model.paymentMethod !== this.posOrderPaymentMethod.Wallet
        ? `${window.location.origin}/branches/${this.branchId}/pos/orders`
        : "";

    this.posOrdersClient.create(this.branchId, model).subscribe({
      next: async (response) => {
        if (response.paymentOrderRedirectUri) {
          this.notificationService.showSuccessNotification(
            `Order ${response.posOrderId} has been submitted successfully.`
          );
          window.location.href = response.paymentOrderRedirectUri;
        }else{
          const alert = await this.alertController.create({
            header: dictionary.SuccessOrder!,
            message: `Order ${response.posOrderId} has been submitted successfully.`,
            animated: false,
            cssClass: "success-buy-alert",
            buttons: [
              {
                text: dictionary.ViewOrders,
                role: "confirm",
                cssClass: "info-alert-btn",
                handler: () => {
                  this.router.navigate([
                    `/branches/${this.branchId}/pos/orders`,
                  ]);
                },
              },
              {
                text: dictionary.ContinueShopping,
                role: "cancel",
                cssClass: "primary-alert-btn",
              },
            ],
          });
          await alert.present();
        }
      },
      error: (error: ResponseErrorDto) => {
        this.loadingService.dismiss();
        throw Error(error.message);
      },
      complete: () => {
        this.initPage();
        this.loadingService.dismiss();
      },
    });
  }

  ngOnDestroy(): void {
    this.initPage$.unsubscribe();
  }
}
