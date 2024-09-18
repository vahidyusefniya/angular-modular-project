import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";

@Component({
  selector: "app-charge",
  templateUrl: "./charge.component.html",
  styleUrls: ["./charge.component.scss"],
})
export class ChargeComponent implements OnInit {
  dictionary = dictionary;
  gateWay: any;
  amount: number | undefined;
  gateWays: string[] = [];

  @Input() isOpen = false;
  @ViewChild("chargeForm") chargeForm: any;
  @Output() dismiss = new EventEmitter();
  @Output() submit = new EventEmitter();
  readonly thousandSeparator: MaskitoOptions = maskitoNumberOptionsGenerator({
    thousandSeparator: ",",
  });
  ngOnInit(): void {
    this.gateWays = [dictionary.Amazon, dictionary.PayPal, dictionary.PayTabs];

    if (this.gateWays.length == 1) {
      this.gateWay = this.gateWays[0];
    }
  }
  resetForm(): void {
    this.amount = undefined;
    this.gateWay = "";
  }

  submitForm(): void {
    if (!this.chargeForm.form.valid) {
      return;
    }
    this.submit.emit();
    this.resetForm();
  }

  onDismiss(): void {
    this.resetForm();
    this.dismiss.emit();
  }
}
