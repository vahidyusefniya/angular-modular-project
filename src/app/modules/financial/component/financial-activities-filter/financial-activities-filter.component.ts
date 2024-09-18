// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Branch, FinancialOrderState, FinancialOrderType } from "@app/proxy/proxy";
import { Subscription } from "rxjs";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { WalletOrdersFilterDto } from "../../dto/financial.dto";
import { CoreService } from "@app/core/services";

@Component({
  selector: "app-financial-activities-filter",
  templateUrl: "./financial-activities-filter.component.html",
  styleUrls: ["./financial-activities-filter.component.scss"],
})
export class FinancialActivitiesFilterComponent implements OnInit {
  dictionary = dictionary;
  filter = new WalletOrdersFilterDto();
  maxDate = new Date().toISOString();
  openMultiSelectCustomerModal = false;
  loading: boolean = false;
  getCustomers$ = new Subscription();
  branchId: number;

  walletOrderTypes: Array<{ name: string; value: FinancialOrderType }> = [
    { name: "Charge", value: FinancialOrderType.Charge },
    { name: "Withdraw", value: FinancialOrderType.Withdraw },
    { name: "Credit", value: FinancialOrderType.Credit },
    { name: "Settle", value: FinancialOrderType.Settle },
    { name: "Rebate", value: FinancialOrderType.Rebate },
  ];

  walletOrderStates: Array<{ name: string; value: FinancialOrderState }> = [
    { name: FinancialOrderState.Unverified, value: FinancialOrderState.Unverified },
    { name: FinancialOrderState.Failed, value: FinancialOrderState.Failed },
    { name: FinancialOrderState.Completed, value: FinancialOrderState.Completed },
  ];

  @Input() data: WalletOrdersFilterDto | undefined;
  @Input() isOpen = false;
  @Input() customers: Branch[] = [];
  @Input() customer: Branch | undefined;
  @Input() hiddenCustomerInput = false;

  @Output() filterClick = new EventEmitter<WalletOrdersFilterDto>();
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
    this.customer
      ? (this.filter.customerMerchantId = this.customer.merchantId)
      : undefined;
    this.filterClick.emit(this.filter);
    this.onDismiss();
  }

  confirmMultiSelectProfilesModal(data: Branch): void {
    this.customer = data;
    this.openMultiSelectCustomerModal = false;
  }

  typeSelectionChange(item: string) {
    if (item === dictionary.Clear) {
      this.filter.walletOrderType = undefined;
    }
  }

  walletOrderStateSelectionChange(item: string) {
    if (item === dictionary.Clear) {
      this.filter.walletOrderState = undefined;
    }
  }
}
