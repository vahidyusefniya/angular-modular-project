import { Component, Input, Output, EventEmitter } from "@angular/core";
import {Bank, Currency} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";

@Component({
  selector: "app-edit-bank",
  templateUrl: "./edit-bank.component.html",
  styleUrls: ["./edit-bank.component.scss"],
})
export class EditBankComponent {
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
    this.submit.emit(this.model);
  }
}
