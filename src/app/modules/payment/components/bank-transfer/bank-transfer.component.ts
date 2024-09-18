import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  ViewChild,
} from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";

@Component({
  selector: "app-bank-transfer",
  templateUrl: "./bank-transfer.component.html",
  styleUrls: ["./bank-transfer.component.scss"],
})
export class BankTransferComponent implements OnInit {
  dictionary = dictionary;
  gateWay: any;
  amount: number | undefined;
  gateWays: string[] = [];

  @Input() isOpen = false;
  @ViewChild("form") form: any;
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
    if (!this.form.form.valid) {
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
