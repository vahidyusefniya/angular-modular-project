// noinspection JSIgnoredPromiseFromCall

import { Currency, PaymentOrderType } from "@app/proxy/proxy";
// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { CoreService } from "@app/core/services";
import { PostPaidFilterDtoDto } from "../../dto/pos-paid.dto";

@Component({
  selector: "app-post-paid-filter",
  templateUrl: "./post-paid-filter.component.html",
  styleUrls: ["./post-paid-filter.component.scss"],
})
export class PostPaidFilterComponent implements OnInit {
  dictionary = dictionary;
  filter = new PostPaidFilterDtoDto();
  maxDate = new Date().toISOString();
  @Input() data: PostPaidFilterDtoDto | undefined;
  @Input() currencies: Currency[] = [];
  @Input() isOpen = false;

  @Output() filterClick = new EventEmitter<PostPaidFilterDtoDto>();
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
