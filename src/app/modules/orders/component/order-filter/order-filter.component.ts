// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CoreService } from "@app/core/services";

import { Branch } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { OrderFilterDto } from "../../dto/order.dto";

@Component({
  selector: "app-mobile-order-filter",
  templateUrl: "./order-filter.component.html",
  styleUrls: ["./order-filter.component.scss"],
})
export class OrderFilterComponent implements OnInit {
  dictionary = dictionary;
  filter = new OrderFilterDto();
  maxDate = new Date().toISOString();

  @Input() customers: Branch[] = [];
  @Input() data: OrderFilterDto | undefined;
  @Input() isOpen = false;

  @Output() filterClick = new EventEmitter<OrderFilterDto>();
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
}
