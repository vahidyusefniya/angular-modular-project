import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { CoreService } from "@core/services";
import { SettleTransactionsFilterDto } from "../../dto/customer.dto";

@Component({
  selector: "app-settle-transactions-filter",
  templateUrl: "./settle-transactions-filter.component.html",
  styleUrls: ["./settle-transactions-filter.component.scss"],
})
export class SettleTransactionsFilterComponent implements OnInit {
  dictionary = dictionary;
  filter = new SettleTransactionsFilterDto();
  maxDate = new Date().toISOString();
  creditTransactionTypes: any = [
    {
      id: 1,
      name: dictionary.Credit
    },
    {
      id: 2,
      name: dictionary.Settle
    }
  ]

  @Input() data: SettleTransactionsFilterDto | undefined;
  @Input() isOpen = false;

  @Output() filterClick = new EventEmitter();
  @Output() dismiss = new EventEmitter();
  constructor(private modalCtrl: ModalController) { }

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
