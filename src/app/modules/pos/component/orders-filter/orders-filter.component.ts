// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { Branch, PosOrderState } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { InprogressStates, PosOrdersFilterDto } from "../../dto/pos.dto";

@Component({
  selector: "app-orders-filter",
  templateUrl: "./orders-filter.component.html",
  styleUrls: ["./orders-filter.component.scss"],
})
export class OrdersFilterComponent implements OnInit {
  dictionary = dictionary;
  filter = new PosOrdersFilterDto();
  loading: boolean = false;
  branchId: number;
  openSelectCustomerModal = false;
  selectedCustomer: string | undefined;

  posOrderStates: Array<{ name: string; value: string }> = [
    { name: dictionary.Inprogress, value: InprogressStates },
    { name: PosOrderState.Failed, value: `7` },
    { name: dictionary.Complete, value: `5` },
    { name: PosOrderState.Paid, value: `2` },
    { name: PosOrderState.Shipping, value: `6` },
  ];

  @Input() data: PosOrdersFilterDto | undefined;
  @Input() isOpen = false;
  @Input() showCustomer = false;
  @Input() customers: Branch[] = [];

  @Output() filterClick = new EventEmitter<PosOrdersFilterDto>();
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
    this.filterClick.emit(this.filter);
    this.onDismiss();
  }

  posOrderStateSelectionChange(item: string) {
    if (item === dictionary.Clear) {
      this.filter.posOrderState = undefined;
    }
  }

  chooseCustomer(customer: Branch) {
    this.selectedCustomer = customer.merchantName;
    this.filter.subMerchantId = customer.merchantId;
  }
}
