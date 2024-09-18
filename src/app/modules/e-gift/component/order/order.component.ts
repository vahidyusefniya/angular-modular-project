// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService, LoadingService } from "@app/core/services";
import { IDescirption, ProductShopDto } from "@app/modules/shop/dto/shop.dto";
import { PriceInvoice, ProductsClient } from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { MaskitoElementPredicateAsync, MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";
import { Subscription } from "rxjs";
import { ICheckout } from "../../dto/e-gift.dto";

@Component({
  selector: "app-order",
  templateUrl: "./order.component.html",
  styleUrls: ["./order.component.scss"],
})
export class OrderComponent implements OnInit {
  dictionary = dictionary;
  productCount = 1;
  amount: string | undefined;
  openProductDescriptionModal = false;
  openCheckoutModal = false;
  amountRangeLabel: string | undefined;
  descriptions: IDescirption[] = [];
  getProductInvoice$ = new Subscription();
  branchId: number;
  checkoutData!: ICheckout;

  readonly thousandSeparator: MaskitoOptions = maskitoNumberOptionsGenerator({
    thousandSeparator: ",",
  });
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) =>
    (el as HTMLIonInputElement).getInputElement();
  priceRangeMessage: string = "";

  @Input() isOpen = false;
  @Input() product!: ProductShopDto;

  @Output() dismiss = new EventEmitter();
  @Output() orderCheckout = new EventEmitter();

  constructor(
    private modalController: ModalController,
    private productsClient: ProductsClient,
    private coreService: CoreService,
    private loadingService: LoadingService
  ) {
    this.branchId = this.coreService.getBranchId()!;
  }

  ngOnInit(): void {
    if (this.product.faceValue) {
      this.amountRangeLabel = `Type an amount between ${this.product.faceValue?.start} and ${this.product.faceValue?.end}`;
    } else this.amountRangeLabel = dictionary.Empty;
  }

  onReduceProductClick(): void {
    if (this.productCount > 0) this.productCount--;
  }
  onAddProductClick(): void {
    this.productCount++;
  }

  onInput(price: any): void {
    if (this.product.faceValue) {
      let priceWithoutComma = Number(price.target.value.replace(/,/g, ""));
      if (!isNaN(priceWithoutComma)) {
        if (
          Number(priceWithoutComma) < this.product.faceValue!.start ||
          Number(priceWithoutComma) > this.product.faceValue!.end!
        ) {
          this.priceRangeMessage = "No price range specified for this amount.";
        } else {
          this.priceRangeMessage = "";
        }
      } else {
        this.priceRangeMessage = "No price range specified for this amount.";
      }
    }
  }

  onCheckoutClick(): void {
    let faceValuePrice = Number(this.amount?.replace(/,/g, ""));
    if (!faceValuePrice) faceValuePrice = this.product.faceValue.start;
    this.loadingService.present();
    this.getProductInvoice$ = this.productsClient
      .getProductInvoice(this.branchId, this.product.productId!, faceValuePrice)
      .subscribe({
        next: (res: PriceInvoice) => {
          this.loadingService.dismiss();
          this.checkoutData = {
            product: this.product,
            faceValuePrice: faceValuePrice,
            unitPrice: res.sellAmount,
            totalPrice: res.sellAmount * this.productCount,
            quantity: this.productCount,
          };
          this.productCount = 1;
          this.openCheckoutModal = true;
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }
  onDismiss(): void {
    this.isOpen = false;
    this.dismiss.emit();
    this.modalController.dismiss();
  }
}
