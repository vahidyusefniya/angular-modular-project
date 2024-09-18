import { Component, OnInit } from "@angular/core";
import { CoreService } from "@app/core/services";
import { Category } from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";

@Component({
  selector: "app-category-list",
  templateUrl: "./category-list.component.html",
  styleUrls: ["./category-list.component.scss"],
})
export class CategoryListComponent implements OnInit {
  dictionary = dictionary;
  categories: Category[] = [];
  loading = false;
  cols: ICol[] = [
    {
      field: "categoryName",
      header: dictionary.Name,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
  ];
  merchantId: number;

  constructor(private coreService: CoreService) {
    this.merchantId = coreService.getMerchantId(
      this.coreService.getBranchId()!,
    )!;
  }

  ngOnInit() {}

  onRefreshClick(): void {}

  onExcelExportClick(): void {}
}
