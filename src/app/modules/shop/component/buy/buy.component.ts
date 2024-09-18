// noinspection JSIgnoredPromiseFromCall

import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService, LoadingService } from "@app/core/services";
import {
  BuyOrderDeliveryType
} from "@app/proxy/proxy";
import { PriceInvoice, ProductsClient } from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";
import { IonInput, ModalController } from "@ionic/angular";
import { MaskitoElementPredicateAsync, MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";
import { Subscription } from "rxjs";
import { Checkout, ProductShopDto } from "../../dto/shop.dto";

@Component({
  selector: "app-buy",
  templateUrl: "./buy.component.html",
  styleUrls: ["./buy.component.scss"],
})
export class BuyComponent implements AfterViewInit, OnInit {
  dictionary = dictionary;
  faceValuePrice: string | undefined;
  localImageSRC = "../../../../../assets/img/placeholder.jpg";
  productCount: any = 1;
  priceRangeMessage: string = "";
  branchId!: number;
  receiveType: string = "";
  phoneNumber: string | undefined;
  email: string | undefined;
  amountRangeLabel: string | undefined;
  getProductInvoice$ = new Subscription();
  isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  width = 0;
  buyOrderDeliveryType = BuyOrderDeliveryType;
  confirmPhoneNumber: string | undefined;
  confirmEmail: string | undefined;
  
  @ViewChild("receiveForm") receiveForm: any;

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.width = event.target.innerWidth;
  }

  readonly thousandSeparator: MaskitoOptions = maskitoNumberOptionsGenerator({
    thousandSeparator: ",",
    precision: 2,
  });
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) =>
    (el as HTMLIonInputElement).getInputElement();

  @Input() isOpen = false;
  @Input() product!: ProductShopDto;

  @ViewChild("receiveForm") receiveForm$: any;
  @ViewChild("customPrice") customPrice!: IonInput;
  @ViewChild("emailInput") emailInput!: IonInput;
  @ViewChild("phoneNumberInput") phoneNumberInput!: IonInput;

  @Output() dismiss = new EventEmitter();
  @Output() continueClick = new EventEmitter<Checkout>();

  constructor(
    private modalController: ModalController,
    private coreService: CoreService,
    private loadingService: LoadingService,
    private shopProductClient: ProductsClient,
  ) {
    this.branchId = this.coreService.getBranchId()!;
  }

  ngOnInit(): void {
    this.width = window.innerWidth;
    if (this.product.faceValue) {
      let textColor: string = this.isDark ? "text-white" : "text-black";
      this.amountRangeLabel = `<span>*Price should exist between <span class="${textColor}">${this.product.faceValue?.start.toLocaleString()}</span> and <span class="${textColor}">${this.coreService.isUnlimitedNumber(this.product.faceValue?.end!)
          ? "ထ"
          : this.product.faceValue?.end?.toLocaleString()
        }</span></span>`;
    } else this.amountRangeLabel = dictionary.Empty;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.customPrice) {
        this.customPrice.setFocus();
      }
    }, 200);
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

  onRedioClick(data: string): void {
    if (this.receiveType === dictionary.WhatsApp || dictionary.SMS) this.phoneNumber = undefined;
    this.receiveType = data;
    setTimeout(() => {
      if (data === BuyOrderDeliveryType.Email) this.emailInput.setFocus();
      else this.phoneNumberInput.setFocus();
    }, 300);
  }

  onInput(price: any): void {
    if (this.product.faceValue) {
      let priceWithoutComma = price.target.value.replace(/,/g, "");
      if (
        Number(priceWithoutComma) < this.product.faceValue!.start ||
        Number(priceWithoutComma) > this.product.faceValue!.end!
      ) {
        this.priceRangeMessage = "No price range specified for this amount.";
      } else {
        this.priceRangeMessage = "";
      }
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
    this.receiveType = "download";
    this.modalController.dismiss();
  }

  onContinueClick(): void {
    if (this.priceRangeMessage != "" || !this.receiveForm$.form.valid) return;
    this.productCount =
      typeof this.productCount === "string"
        ? Number((this.productCount as any)?.replace(/,/g, ""))
        : this.productCount;
    this.receiveForm.form.markAllAsTouched();
    if (this.receiveForm.form.invalid) return;
    let faceValuePrice = Number(this.faceValuePrice?.replace(/,/g, ""));
    if (!faceValuePrice) faceValuePrice = this.product.faceValue.start;
    this.loadingService.present();
    this.getProductInvoice$ = this.shopProductClient
      .getProductInvoice(this.branchId, this.product.productId!, faceValuePrice)
      .subscribe({
        next: (res: PriceInvoice) => {
          this.loadingService.dismiss();
          let data: Checkout = {
            type: this.receiveType,
            product: this.product,
            faceValuePrice: faceValuePrice,
            unitPrice: res.sellAmount,
            totalPrice: res.sellAmount * this.productCount,
            quantity: this.productCount,
            deliveryTypeValue: this.getDeliveryTypeValue(),
            email: this.email,
          };
          this.continueClick.emit(data);
          this.receiveForm.resetForm();
          this.productCount = 1;
          this.onDismiss();
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  getDeliveryTypeValue(): string | null {
    if (this.receiveType === this.buyOrderDeliveryType.Email) {
      return this.email!;
    } else if (this.receiveType === this.dictionary.WhatsApp || this.receiveType === this.dictionary.SMS) {
      return String(this.phoneNumber)!;
    } else {
      return null;
    }
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
