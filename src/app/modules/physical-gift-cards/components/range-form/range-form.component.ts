// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { CoreService } from "@app/core/services";
import { IButtonFaceValue } from "@app/modules/activate/dto/activate.dto";
import { PriceRangeDto } from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";
import { MaskitoElementPredicateAsync, MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";

@Component({
  selector: "app-range-form",
  templateUrl: "./range-form.component.html",
  styleUrls: ["./range-form.component.scss"],
})
export class RangeFormComponent implements OnInit {
  dictionary = dictionary;
  faceValuePrice: string | undefined;
  priceRangeMessage: string = "";
  amountRangeLabel: string | undefined;
  isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  @Input() activeFaceValue: IButtonFaceValue | undefined
  @Output() setActiveFaceValue = new EventEmitter()
  @ViewChild("activeForm") activeForm: any;
  readonly thousandSeparator: MaskitoOptions = maskitoNumberOptionsGenerator({
    thousandSeparator: ",",
    precision: 2,
  });
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) =>
    (el as HTMLIonInputElement).getInputElement();


  constructor(
    private coreService: CoreService,
  ) {}

  ngOnInit() {
    if (this.activeFaceValue) {
      let textColor: string = this.isDark ? "text-white" : "text-black";
      this.amountRangeLabel = `<span>*Price should exist between <span class="${textColor}">${this.activeFaceValue?.start!.toLocaleString()}</span> and <span class="${textColor}">${
        this.coreService.isUnlimitedNumber(this.activeFaceValue?.end!)
          ? "ထ"
          : this.activeFaceValue?.end?.toLocaleString()
      }</span></span>`;
    } else this.amountRangeLabel = dictionary.Empty;
  }

  onInput(price: any): void {
    if (this.activeFaceValue) {
      let priceWithoutComma = price.target.value.replace(/,/g, "");
      if (
        Number(priceWithoutComma) < this.activeFaceValue!.start! ||
        Number(priceWithoutComma) > this.activeFaceValue!.end!
      ) {
        this.priceRangeMessage = "No price range specified for this amount.";
      } else {
        this.priceRangeMessage = "";
      }
    }
  }

  onContinueClick() {
    if (this.priceRangeMessage != "" || !this.activeForm.form.valid) return;
    this.setActiveFaceValue.emit(this.faceValuePrice)
  }
}
