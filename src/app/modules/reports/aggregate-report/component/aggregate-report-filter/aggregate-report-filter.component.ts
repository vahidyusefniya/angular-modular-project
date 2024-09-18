import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { AggregateReportFilterDto } from "../../dto/aggregate-report.dto";
import { AggregateReportService } from "../../service/aggregate-report.service";

@Component({
  selector: "app-aggregate-report-filter",
  templateUrl: "./aggregate-report-filter.component.html",
  styleUrls: ["./aggregate-report-filter.component.scss"],
})
export class AggregateReportFilterComponent implements OnInit {
  dictionary = dictionary;
  aggregateReportFilter = new AggregateReportFilterDto();
  maxDate = new Date().toISOString();

  @Output() dismiss = new EventEmitter();
  @Output() reportFilterClick = new EventEmitter<AggregateReportFilterDto>();
  @Input() isOpen = false;
  @Input() data: AggregateReportFilterDto | undefined;

  constructor(
    private modalCtrl: ModalController,
    private aggregateReportService: AggregateReportService
  ) { }

  ngOnInit() {
    this.aggregateReportFilter.init(this.data!);
  }

  onDismiss() {
    this.modalCtrl.dismiss();
    this.dismiss.emit({ value: false, data: this.aggregateReportFilter });
  }

  onFilterClick() {
    if (this.aggregateReportFilter.end) {
      this.aggregateReportFilter.end =
        this.aggregateReportService.getUtcDateTimeForFilterDatePicker(
          this.aggregateReportFilter.end
        );
    }
    if (this.aggregateReportFilter.from) {
      this.aggregateReportFilter.from =
        this.aggregateReportService.getUtcDateTimeForFilterDatePicker(
          this.aggregateReportFilter.from
        );
    }
    this.reportFilterClick.emit(this.aggregateReportFilter);
    this.onDismiss();
  }
}
