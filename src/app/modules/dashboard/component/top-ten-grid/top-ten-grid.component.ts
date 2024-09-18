// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { TopTenItemDto } from "../../dto/dashboard.dto";
import { ICol } from "@app/shared/components/page-list/page-list.model";

@Component({
  selector: "app-top-ten-grid",
  templateUrl: "./top-ten-grid.component.html",
  styleUrls: ["./top-ten-grid.component.scss"],
})
export class TopTenGridComponent implements OnInit {
  dictionary = dictionary;
  loading = false;
  totalSale = 0;
  totalProfit = 0;

  @Input() data: TopTenItemDto[] = [];

  ngOnInit() {
    this.data.forEach((item) => {
      this.totalProfit += item.profit!;
      this.totalSale += item.sales!;
    });
  }
}
