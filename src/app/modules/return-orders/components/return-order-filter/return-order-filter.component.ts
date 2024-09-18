import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SalesManagerService } from '@app/modules/sales-manager/service/sales-manager.service';
import { dictionary } from '@dictionary/dictionary';
import { ModalController } from '@ionic/angular';
import { ReturnOrderFilterDto } from './../../dto/return-order.dto';

@Component({
  selector: 'app-return-order-filter',
  templateUrl: './return-order-filter.component.html',
  styleUrls: ['./return-order-filter.component.scss'],
})
export class ReturnOrderFilterComponent implements OnInit {
  dictionary = dictionary;
  reportFilter = new ReturnOrderFilterDto();
  maxDate = new Date().toISOString();

  @Output() dismiss = new EventEmitter();
  @Output() reportFilterClick = new EventEmitter<ReturnOrderFilterDto>();
  @Input() isOpen = false;
  @Input() data: ReturnOrderFilterDto | undefined;


  constructor(
    private modalCtrl: ModalController,
    private salesService: SalesManagerService
  ) { }

  ngOnInit() {
    this.reportFilter.init(this.data!);
  }


  onDismiss() {
    this.modalCtrl.dismiss();
    this.dismiss.emit({ value: false, data: this.reportFilter });
  }

  onFilterClick() {
    if (this.reportFilter.end) {
      this.reportFilter.end = this.salesService.getUtcDateTimeForFilterDatePicker(
        this.reportFilter.end
      );
    }
    if (this.reportFilter.from) {
      this.reportFilter.from = this.salesService.getUtcDateTimeForFilterDatePicker(
        this.reportFilter.from
      );
    }
    this.reportFilterClick.emit(this.reportFilter);
    this.onDismiss();
  }
}
