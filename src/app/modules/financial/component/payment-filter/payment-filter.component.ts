// noinspection JSIgnoredPromiseFromCall

import { Currency, PaymentOrderType } from "@app/proxy/proxy";
// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { CoreService } from "@app/core/services";
import { PaymentFilterDtoDto } from "../../dto/payment.dto";

@Component({
  selector: "app-payment-filter",
  templateUrl: "./payment-filter.component.html",
  styleUrls: ["./payment-filter.component.scss"],
})
export class PaymentFilterComponent implements OnInit {
  dictionary = dictionary;
  filter = new PaymentFilterDtoDto();
  maxDate = new Date().toISOString();
  paymentOrderTypes: Array<{ name: string; value: PaymentOrderType }> = [
    { name: dictionary.POS, value: PaymentOrderType.ChargeByPosOrder },
    { name: dictionary.PostPaid, value: PaymentOrderType.ChargeByPostPay },
    { name: dictionary.Charge, value: PaymentOrderType.DirectCharge },
  ];
  @Input() data: PaymentFilterDtoDto | undefined;
  @Input() currencies: Currency[] = [];
  @Input() isOpen = false;

  @Output() filterClick = new EventEmitter<PaymentFilterDtoDto>();
  @Output() dismiss = new EventEmitter();

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.data) this.filter.init(this.data);
  }

  onDismiss() {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  paymentOrderTypeSelectionChange(item: string) {
    if (item === dictionary.Clear) {
      this.filter.paymentOrderType = undefined;
    }
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
