// noinspection JSIgnoredPromiseFromCall

import { Component, Input } from "@angular/core";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";

@Component({
  selector: "app-dashboard-grid",
  templateUrl: "./dashboard-grid.component.html",
  styleUrls: ["./dashboard-grid.component.scss"],
})
export class DashboardGridComponent {
  dictionary = dictionary;
  page: number = 1;
  pageSize: number = 10;

  cols: ICol[] = [
    {
      width: "auto",
      hidden: false,
      field: "name",
      hasNormalRow: true,
      linkRowPermission: "CustomerRead",
      header: dictionary.Name,
      sortable: false,
    },
    {
      width: "auto",
      hidden: false,
      field: "sales",
      hasNumberRow: true,
      linkRowPermission: "CustomerRead",
      header: dictionary.Sales,
      sortable: true,
    },
    {
      width: "auto",
      hidden: false,
      field: "profit",
      hasNumberRow: true,
      linkRowPermission: "CustomerRead",
      header: dictionary.Profit,
      sortable: true,
    },
  ];
  @Input() title: string | undefined;
  @Input() loading: boolean = false;
  @Input() rows: any[] = [];
  @Input() totalSale = 0;
  @Input() totalProfit = 0;
}
