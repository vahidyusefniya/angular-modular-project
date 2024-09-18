// noinspection JSIgnoredPromiseFromCall

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { Region } from "@app/proxy/proxy";
import { CategoryProduct, ProductsClient } from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";
import { NavController } from "@ionic/angular";
import { Subscription } from "rxjs";
import { EGiftService } from "../../service/e-gift.service";

@Component({
  selector: "app-e-gift",
  templateUrl: "./e-gift.component.html",
  styleUrls: ["./e-gift.component.scss"],
})
export class EGiftComponent implements OnInit, OnDestroy {
  categories: CategoryProduct[] = [];
  openRegionModal = false;
  regionImage: string | undefined;
  selectedRegion: Region | undefined;
  loading = false;
  getCategories$ = new Subscription();
  branchId: number;
  searchValue = dictionary.Empty;

  constructor(
    private router: NavController,
    private activatedRoute: ActivatedRoute,
    public coreService: CoreService,
    private eGiftService: EGiftService,
    private layoutService: LayoutService,
    private productsClient: ProductsClient
  ) {
    this.branchId = coreService.getBranchId()!;
    this.activatedRoute.queryParams.subscribe((params) => {
      this.searchValue = params["search"];
    });
    this.layoutService.selectedBranch.subscribe((branch) => {
      this.branchId = branch.branchId;
      this.initPage();
    });
  }

  ngOnInit() {
    const branch = this.layoutService.branch;
    if (branch?.canPlaceOrder) this.initPage();
    else this.router.navigateForward(`/branches/${branch?.branchId}/orders`);
  }
  initPage(): void {
    this.initCategoryProduct();
    if (!this.regionImage) {
      this.regionImage = this.eGiftService.getRegions()[0].image!;
    }
  }

  initCategoryProduct(): void {
    const me = this;
    this.loading = true;
    this.getCategories$ = this.productsClient
      .getProducts(this.branchId, true, this.selectedRegion?.regionId)
      .subscribe({
        next: (res: CategoryProduct) => {
          if (res) {
            this.categories = res.categories!;
          }
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
        complete() {
          me.loading = false;
        },
      });
  }

  chooseRegion(region: Region): void {
    this.openRegionModal = false;
    this.regionImage = region.imageUrl!;
    this.selectedRegion = region;
    this.initCategoryProduct();
  }

  onInputSearch(value: string): void {
    if (!value) return;
    this.eGiftService.clearSearchBarValue("searchbar");
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
    if (category.categories && category.categories.length > 0) {
      this.router.navigateForward(
        [`/branches/${this.branchId}/eGift/categories`],
        {
          relativeTo: this.activatedRoute,
          queryParams: {
            title: category.categoryName,
            categoryId: category.categoryId,
          },
          queryParamsHandling: "merge",
          animated: false,
        }
      );
    } else {
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

  ngOnDestroy(): void {
    this.getCategories$.unsubscribe();
  }
}
