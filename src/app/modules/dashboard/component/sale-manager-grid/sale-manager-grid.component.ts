// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { SaleManagerDto } from "../../dto/dashboard.dto";

@Component({
  selector: "app-sale-manager-grid",
  templateUrl: "./sale-manager-grid.component.html",
  styleUrls: ["./sale-manager-grid.component.scss"],
})
export class SaleManagerGridComponent implements OnInit {
  dictionary = dictionary;
  loading = false;
  totalSale = 0;
  totalProfit = 0;

  @Input() data: SaleManagerDto[] = [];

  ngOnInit() {
    this.data.forEach((item) => {
      this.totalProfit += item.profit!;
      this.totalSale += item.sales!;
    });
  }
}
