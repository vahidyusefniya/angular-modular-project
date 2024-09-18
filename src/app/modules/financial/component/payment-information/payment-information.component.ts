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

interface IPayment {
  id: number;
  title: string;
  icon: string;
  description: string;
}

@Component({
  selector: "app-payment-information",
  templateUrl: "./payment-information.component.html",
  styleUrls: ["./payment-information.component.scss"],
})
export class PaymentInformationComponent implements OnInit {
  dictionary = dictionary;
  gateWay: any;
  amount: number | undefined;
  gateWays: string[] = [];

  @Input() isOpen = false;
  @Input() payment: IPayment = {
    id: 1,
    title: "",
    icon: "",
    description: "",
  };
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
