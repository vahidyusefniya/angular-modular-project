import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Currency } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";

@Component({
  selector: "app-edit-currency",
  templateUrl: "./edit-currency.component.html",
  styleUrls: ["./edit-currency.component.scss"],
})
export class EditCurrencyComponent {
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
    this.submit.emit(this.model);
  }
}
