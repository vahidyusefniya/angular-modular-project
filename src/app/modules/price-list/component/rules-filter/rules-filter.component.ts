import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Currency } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-rules-filter",
  templateUrl: "./rules-filter.component.html",
  styleUrls: ["./rules-filter.component.scss"],
})
export class RulesFilterComponent implements OnInit {
  dictionary = dictionary;
  label: string | undefined;
  currencyId: number | undefined;

  @Input() isOpen = false;
  @Input() selectedCurrency: number | undefined;

  @Output() dismiss = new EventEmitter();
  @Output() FilterRules = new EventEmitter();

  constructor(private modalCtrl: ModalController) {}

  ngOnInit(): void {
    if (this.selectedCurrency) {
      this.currencyId = this.selectedCurrency;
    }
  }
  onFilterClick(): void {
    this.FilterRules.emit(this.currencyId);
    this.modalCtrl.dismiss();
  }
  currencyChange(data: string): void {
    if (data === dictionary.Clear) {
      this.currencyId = undefined;
    }
  }
  onDismiss(): void {
    this.dismiss.emit();
    // noinspection JSIgnoredPromiseFromCall
    this.modalCtrl.dismiss();
  }
}
