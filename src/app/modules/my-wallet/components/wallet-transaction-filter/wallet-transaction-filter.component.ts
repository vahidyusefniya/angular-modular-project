// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { LoadingService } from "@app/core/services";
import { MerchantDto } from "@app/modules/orders/dto/order.dto";
import {
  Branch,
  CurrenciesClient,
  Currency,
  TransferWalletType,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { WalletTransactionFilterDto } from "../../dto/my-wallet.dto";

@Component({
  selector: "app-wallet-transaction-filter",
  templateUrl: "./wallet-transaction-filter.component.html",
  styleUrls: ["./wallet-transaction-filter.component.scss"],
})
export class WalletTransactionFilterComponent implements OnInit {
  dictionary = dictionary;
  filter = new WalletTransactionFilterDto();
  maxDate = new Date().toISOString();

  @Input() merchants: MerchantDto[] = [];
  @Input() data: WalletTransactionFilterDto | undefined;
  @Input() isOpen = false;
  @Input() customers: Branch[] = [];

  transferWalletTypes: Array<{ name: string; value: TransferWalletType }> = [
    { name: "Charge", value: TransferWalletType.Charge },
    { name: "Withdraw", value: TransferWalletType.Withdraw },
    { name: "PosOrder", value: TransferWalletType.PosOrder },
    { name: "Buy", value: TransferWalletType.Buy },
    { name: "Credit", value: TransferWalletType.Credit },
    { name: "Payment", value: TransferWalletType.Payment },
    { name: "Rebate", value: TransferWalletType.Rebate },
    { name: "Settle credit", value: TransferWalletType.Settle },
  ];

  @Output() filterClick = new EventEmitter<WalletTransactionFilterDto>();
  @Output() dismiss = new EventEmitter();
  @Output() showMerchantModal = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private currenciesClient: CurrenciesClient,
    private loadingService: LoadingService
  ) {}

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
    this.modalCtrl.dismiss();
  }

  onMerchantClick() {
    this.onDismiss();
    this.showMerchantModal.emit();
  }

  typeSelectionChange(item: string) {
    if (item === dictionary.Clear) {
      this.filter.walletTransactionType = undefined;
    }
  }
}
