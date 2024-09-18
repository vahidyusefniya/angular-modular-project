// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { OfficeDto } from "../../dto/dashboard.dto";

@Component({
  selector: "app-offices-grid",
  templateUrl: "./offices-grid.component.html",
  styleUrls: ["./offices-grid.component.scss"],
})
export class OfficesGridComponent implements OnInit {
  dictionary = dictionary;
  loading: boolean = false;
  totalSale = 0;
  totalProfit = 0;

  @Input() data: OfficeDto[] = [];

  ngOnInit() {
    this.data.forEach((item) => {
      this.totalProfit += item.profit!;
      this.totalSale += item.sales!;
    });
  }
}
