// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { Branch, PosOrderState } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { PhysicalCardOrdersFilterDto } from "../../dto/orders.dto";

@Component({
  selector: "app-orders-filter",
  templateUrl: "./orders-filter.component.html",
  styleUrls: ["./orders-filter.component.scss"],
})
export class OrdersFilterComponent implements OnInit {
  dictionary = dictionary;
  filter = new PhysicalCardOrdersFilterDto();
  loading: boolean = false;
  branchId: number;
  maxDate = new Date().toISOString();
  openSelectCustomerModal = false;
  selectedCustomer: string | undefined;

  physicalCardOrderStates: Array<{ name: string; value: string }> = [
    { name: dictionary.ReadyForShip, value: "1" },
    { name: PosOrderState.Delivered, value: "2" },
    { name: dictionary.Shipping, value: "3" },
    { name: PosOrderState.Failed, value: "4" },
  ];

  @Input() data: PhysicalCardOrdersFilterDto | undefined;
  @Input() isOpen = false;
  @Input() showCustomer = false;
  @Input() customers: Branch[] = [];
  @Output() filterClick = new EventEmitter<PhysicalCardOrdersFilterDto>();
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private coreService: CoreService
  ) {
    this.branchId = this.coreService.getBranchId()!;
  }

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
    this.onDismiss();
  }

  physicalCardOrderStateSelectionChange(item: string) {
    if (item === dictionary.Clear) {
      this.filter.physicalCardOrderState = undefined;
    }
  }

  chooseCustomer(customer: Branch) {
    this.selectedCustomer = customer.merchantName;
    this.filter.subMerchantId = customer.merchantId.toString();
  }
}
