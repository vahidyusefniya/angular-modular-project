import { Component, Input, Output, EventEmitter } from "@angular/core";
import {Bank, Currency} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";

@Component({
  selector: "app-add-bank",
  templateUrl: "./add-bank.component.html",
  styleUrls: ["./add-bank.component.scss"],
})
export class AddBankComponent {
  dictionary = dictionary;
  loading = false;

  @Input() isOpen: boolean = false;
  @Input() model = new Bank();
  @Output() dismiss = new EventEmitter();
  @Output() submit = new EventEmitter();

  onDismiss(): void {
    this.dismiss.emit();
  }

  submitForm(): void {
    this.submit.emit(this.model.bankName);
    this.onDismiss();
  }
}
