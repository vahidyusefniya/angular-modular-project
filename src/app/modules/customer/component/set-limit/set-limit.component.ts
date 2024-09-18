import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CreateMerchantCurrencyLimitRequest } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { environment } from "@environments/environment";
import { ModalController } from "@ionic/angular";
import { MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";

@Component({
  selector: "app-set-limit",
  templateUrl: "./set-limit.component.html",
  styleUrls: ["./set-limit.component.scss"],
})
export class SetLimitComponent implements OnInit {
  dictionary = dictionary;
  limitationInput = new CreateMerchantCurrencyLimitRequest();
  haslimitaionData: boolean = false;
  readonly thousandSeparator: MaskitoOptions = maskitoNumberOptionsGenerator({
    thousandSeparator: ",",
    precision: environment.precision,
  });

  @Input() isOpen = false;
  @Input() data: CreateMerchantCurrencyLimitRequest | undefined;
  @Output() dismiss = new EventEmitter();
  @Output() submitLimitation = new EventEmitter<any>();

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.data?.currencyId) {
      this.limitationInput.init(this.data);
      this.haslimitaionData = true;
    }
  }

  cancel(): void {
    this.haslimitaionData = false;
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onClickSave() {
    let state;
    this.haslimitaionData ? (state = "edit") : (state = "new");
    this.limitationInput.amount = parseFloat(
      (this.limitationInput.amount?.toString() as any).replace(/,/g, "")
    );
    this.submitLimitation.emit({ data: this.limitationInput, state });
    this.cancel();
  }
}
