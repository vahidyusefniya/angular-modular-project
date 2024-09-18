// noinspection JSIgnoredPromiseFromCall

import { Currency } from "@app/proxy/proxy";
// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import {
  BuysFilterDto,
  buyOrderStatesPending,
} from "@app/modules/reports/buys/dto/order.dto";
import { Branch } from "@app/proxy/proxy";
import { ModalController } from "@ionic/angular";
import { CoreService } from "@app/core/services";

@Component({
  selector: "app-buys-filter",
  templateUrl: "./buys-filter.component.html",
  styleUrls: ["./buys-filter.component.scss"],
})
export class BuysFilterComponent implements OnInit {
  dictionary = dictionary;
  filter = new BuysFilterDto();
  maxDate = new Date().toISOString();
  buyOrderStates = [
    {
      name: dictionary.Complete,
      id: "5",
    },
    {
      name: dictionary.Failed,
      id: "4",
    },
    {
      name: dictionary.Pending,
      id: buyOrderStatesPending,
    },
  ];

  @Input() data: BuysFilterDto | undefined;
  @Input() isOpen = false;

  @Output() filterClick = new EventEmitter<BuysFilterDto>();
  @Output() dismiss = new EventEmitter();

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.data) this.filter.init(this.data);
  }

  onDismiss() {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onFilterClick(): void {
    if (this.filter.end) {
      this.filter.end = CoreService.getUtcDateTimeForFilterDatePicker(
        this.filter.end
      );
    }
    if (this.filter.from) {
      this.filter.from = CoreService.getUtcDateTimeForFilterDatePicker(
        this.filter.from
      );
    }
    this.filterClick.emit(this.filter);
    this.modalCtrl.dismiss();
  }
  currencySelectionChange(item: Currency) {
    if (!item) {
      this.filter.currencyId = undefined;
    }
  }

  buyOrderStatesSelectionChange(item: string) {
    if (item === dictionary.Clear) {
      this.filter.buyOrderStates = undefined;
    }
  }
}
