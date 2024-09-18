import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Currency } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";

@Component({
  selector: "app-add-currency",
  templateUrl: "./add-currency.component.html",
  styleUrls: ["./add-currency.component.scss"],
})
export class AddCurrencyComponent {
  dictionary = dictionary;
  loading = false;

  @Input() isOpen: boolean = false;
  @Input() model = new Currency();
  @Output() dismiss = new EventEmitter();
  @Output() submit = new EventEmitter();

  onDismiss(): void {
    this.dismiss.emit();
  }

  submitForm(): void {
    this.submit.emit(this.model.currencyName);
    this.onDismiss();
  }
}
