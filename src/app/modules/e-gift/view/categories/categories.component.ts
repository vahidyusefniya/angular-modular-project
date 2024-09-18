// noinspection JSIgnoredPromiseFromCall

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CoreService } from "@app/core/services";
import { NavController } from "@ionic/angular";
import { EGiftService } from "../../service/e-gift.service";
import { LayoutService } from "@app/layout";
import { CategoryProduct } from "@app/proxy/shop-proxy";

@Component({
  selector: "app-categories",
  templateUrl: "./categories.component.html",
  styleUrls: ["./categories.component.scss"],
})
export class CategoriesComponent implements OnInit {
  categories: CategoryProduct[] = [];
  loading = false;
  branchId: number;
  title: string | undefined;
  categoryId: number | undefined;

  constructor(
    private router: NavController,
    private eGiftService: EGiftService,
    private coreService: CoreService,
    private activatedRoute: ActivatedRoute,
    private layoutService: LayoutService
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.activatedRoute.queryParams.subscribe((params) => {
      this.title = params["title"];
      this.categoryId = Number(params["categoryId"]);
    });
  }

  ngOnInit() {
    this.initCategories();
  }
  initCategories(): void {
    const categoryProduct = this.layoutService.rootCategory;
    if (categoryProduct) {
      const categories = this.eGiftService.findCategory(
        categoryProduct,
        this.categoryId!
      )?.categories;
      if (categories) {
        this.categories = categories;
      }
    }
  }

  onInputSearch(value: string): void {
    this.router.navigateForward([`/branches/${this.branchId}/eGift/search`], {
      relativeTo: this.activatedRoute,
      queryParams: {
        search: value,
      },
      queryParamsHandling: "merge",
      animated: false,
    });
  }

  onCategoryClick(category: CategoryProduct): void {
    this.router.navigateForward([`/branches/${this.branchId}/eGift/search`], {
      relativeTo: this.activatedRoute,
      queryParams: {
        title: category.categoryName,
        categoryId: category.categoryId,
      },
      queryParamsHandling: "merge",
      animated: false,
    });
  }
}
