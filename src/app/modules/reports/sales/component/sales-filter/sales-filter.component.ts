// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { OrderFilterDto } from "@app/modules/reports/sales/dto/order.dto";
import { Branch, Currency } from "@app/proxy/proxy";
import { ModalController } from "@ionic/angular";
import { CoreService } from "@app/core/services";
import { buyOrderStatesPending } from "@app/modules/reports/buys/dto/order.dto";

@Component({
  selector: "app-sales-filter",
  templateUrl: "./sales-filter.component.html",
  styleUrls: ["./sales-filter.component.scss"],
})
export class SalesFilterComponent implements OnInit {
  dictionary = dictionary;
  filter = new OrderFilterDto();
  maxDate = new Date().toISOString();
  openSelectCustomerModal = false;
  selectedCustomer: string | undefined;
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

  @Input() customers: Branch[] = [];
  @Input() data: OrderFilterDto | undefined;
  @Input() isOpen = false;
  @Input() customerId: number | undefined;

  @Output() filterClick = new EventEmitter<OrderFilterDto>();
  @Output() dismiss = new EventEmitter();

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.data) {
      this.filter.init(this.data);
      if (this.filter.customer) {
        this.selectedCustomer = this.customers.filter(
          (item) => item.merchantId === this.filter.customer
        )[0].merchantName;
      }
    }
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
  currencySelectionChange(item: string) {
    if (item === dictionary.Clear) {
      this.filter.currency = undefined;
    }
  }

  customerSelectionChange(item: string) {
    if (item === dictionary.Clear) {
      this.filter.customer = undefined;
    }
  }
  buyOrderStatesSelectionChange(item: string) {
    if (item === dictionary.Clear) {
      this.filter.buyOrderStates = undefined;
    }
  }

  chooseCustomer(customer: Branch) {
    this.selectedCustomer = customer.merchantName;
    this.filter.customer = customer.merchantId;
  }
}
