// noinspection JSIgnoredPromiseFromCall

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService, LoadingService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { BasketProductShopDto, Checkout, ProductShopDto } from "@app/modules/shop/dto/shop.dto";
import { PriceListsClient, BuyOrderDeliveryType } from "@app/proxy/proxy";
import { PriceInvoice, ProductsClient } from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";
import { AlertController, IonInput, ModalController } from "@ionic/angular";
import { MaskitoElementPredicateAsync, MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";
import { Subscription } from "rxjs";

@Component({
  selector: "app-buy",
  templateUrl: "./buy.component.html",
  styleUrls: ["./buy.component.scss"],
})
export class BuyComponent implements OnInit {
  dictionary = dictionary;
  faceValuePrice: string | undefined;
  localImageSRC = "../../../../../assets/img/placeholder.jpg";
  productCount: any = 1;
  branchId!: number;
  receiveType: string = "download";
  phoneNumber: string | undefined;
  email: string | undefined;
  amountRangeLabel: string | undefined;
  getProductInvoice$ = new Subscription();
  isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  width = 0;
  buyOrderDeliveryType = BuyOrderDeliveryType;

  @ViewChild("receiveForm") receiveForm: any;

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.width = event.target.innerWidth;
  }

  readonly thousandSeparator: MaskitoOptions = maskitoNumberOptionsGenerator({
    thousandSeparator: ",",
  });

  @Input() isOpen = false;
  @Input() product!: BasketProductShopDto;

  @ViewChild("receiveForm") receiveForm$: any;
  @Output() dismiss = new EventEmitter();
  @Output() continueClick = new EventEmitter<BasketProductShopDto>();

  constructor(
    private modalController: ModalController,
    private priceListsClient: PriceListsClient,
    private coreService: CoreService,
    private loadingService: LoadingService,
    private productsClient: ProductsClient,
    private layoutService: LayoutService,
    private alertController: AlertController,
  ) {
    this.branchId = this.coreService.getBranchId()!;
  }

  ngOnInit(): void {
    this.width = window.innerWidth;
  }

  onReduceProductClick(): void {
    if (typeof this.productCount === "number") {
      this.productCount--;
    } else {
      this.productCount = (
        parseFloat((this.productCount.toString() as any).replace(/,/g, "")) - 1
      ).toLocaleString();
    }
  }
  onAddProductClick(): void {
    if (typeof this.productCount === "number" || !this.productCount) {
      this.productCount++;
    } else {
      this.productCount = (
        parseFloat((this.productCount.toString() as any).replace(/,/g, "")) + 1
      ).toLocaleString();
    }
  }
  onDismiss(): void {
    this.isOpen = false;
    this.dismiss.emit();
    this.receiveForm.resetForm();
    this.productCount = 1;
    this.modalController.dismiss();
  }

  onAddToCardClick(): void {
    if (!this.receiveForm$.form.valid) return;
    this.productCount =
      typeof this.productCount === "string"
        ? Number((this.productCount as any)?.replace(/,/g, ""))
        : this.productCount;
        
    this.loadingService.present();
    setTimeout(async () => {
      this.layoutService.addToCard({
        ...this.product,
        quantity: this.productCount
      })
      const buttons = [
        {
          text: dictionary.Continue,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
        {
          text: dictionary.Checkout,
          role: "confirm",
          cssClass: "primary-alert-btn",
          handler: () => {
            this.layoutService.setDrawer(true)
            this.layoutService.setCheckoutModal(true)
          },
        },
      ];

      const buyAlert = await this.alertController.create({
        message: dictionary.DoYouWantToContinueShoppingOrCheckout,
        animated: false,
        buttons: buttons,
      });

      await buyAlert.present();
      this.loadingService.dismiss();
      this.onDismiss()
    }, 1000)
  }

  checkDisabledReduceButton(): boolean {
    let value =
      typeof this.productCount === "number"
        ? this.productCount
        : parseFloat((this.productCount?.toString() as any)?.replace(/,/g, ""));
    if (value === 0 || !this.productCount) {
      return true;
    } else {
      return false;
    }
  }
}
