import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { dictionary } from '@dictionary/dictionary';
import { ModalController } from '@ionic/angular';
import { ReportFilterDto } from '../../dto/sales-manager.dto';
import { SalesManagerService } from '../../service/sales-manager.service';

@Component({
  selector: 'app-reports-filter',
  templateUrl: './reports-filter.component.html',
  styleUrls: ['./reports-filter.component.scss'],
})
export class ReportsFilterComponent implements OnInit {
  dictionary = dictionary;
  reportFilter = new ReportFilterDto();
  maxDate = new Date().toISOString();

  @Output() dismiss = new EventEmitter();
  @Output() reportFilterClick = new EventEmitter<ReportFilterDto>();
  @Input() isOpen = false;
  @Input() data: ReportFilterDto | undefined;


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
