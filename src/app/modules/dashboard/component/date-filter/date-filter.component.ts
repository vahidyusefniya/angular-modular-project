import { Component, Input, OnInit } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { CustomDateFilterDto } from "../../dto/dashboard.dto";

@Component({
  selector: "app-date-filter",
  templateUrl: "./date-filter.component.html",
  styleUrls: ["./date-filter.component.scss"],
})
export class DateFilterComponent implements OnInit {
  dictionary = dictionary;
  filter = new CustomDateFilterDto();
  minDate = new Date("2020-01-01").toISOString();
  maxDate = new Date().toISOString();

  @Input() data = new CustomDateFilterDto();
  @Input() subject: Subject<CustomDateFilterDto> =
    new Subject<CustomDateFilterDto>();

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.data.endTime) this.filter.endTime = this.data.endTime;
    if (this.data.beginTime) this.filter.beginTime = this.data.beginTime;
  }
  onFilterClick() {
    this.subject.next(this.filter);
  }
  close() {
    // noinspection JSIgnoredPromiseFromCall
    this.modalCtrl.dismiss();
  }

  selectionBeginTimeChange(date: string): void {
    if (!date) return;
    const maxDay = 1000 * 60 * 60 * 24 * 30;
    const maxDate = new Date(new Date(date).getTime() + maxDay);
    this.maxDate = maxDate.toISOString();
  }
  selectionEndTimeChange(date: string): void {
    if (!date) return;
    const maxDay = 1000 * 60 * 60 * 24 * 30;
    const maxDate = new Date(new Date(date).getTime() - maxDay);
    this.minDate = maxDate.toISOString();
  }
}
