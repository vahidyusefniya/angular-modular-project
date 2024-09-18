// noinspection JSIgnoredPromiseFromCall

import { Component, Input, OnInit } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { CustomerDto } from "../../dto/dashboard.dto";

@Component({
  selector: "app-customer-grid",
  templateUrl: "./customer-grid.component.html",
  styleUrls: ["./customer-grid.component.scss"],
})
export class CustomerGridComponent implements OnInit {
  dictionary = dictionary;
  loading: boolean = false;
  totalSale = 0;
  totalProfit = 0;

  @Input() data: CustomerDto[] = [];

  ngOnInit() {
    this.data.forEach((item) => {
      this.totalProfit += item.profit!;
      this.totalSale += item.sales!;
    });
  }
}
