import { HttpParams } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  IPageChange,
  ITag,
  LoadingService,
  TagService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  BuyPrice,
  BuyPriceRule,
  CategoriesClient,
  Category,
  CurrenciesClient,
  Currency,
  PriceListsClient,
  ProductSummary,
} from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { Subscription, combineLatest } from "rxjs";
import {
  IMyPriceListFilterDto,
  IMyPriceListFilterTag,
  MyPriceListFilterDto,
} from "../../dto/price-list.dto";
import { PriceListService } from "../../service/price-list.service";
import { SortEvent } from "primeng/api";

@Component({
  selector: "app-my-price-list",
  templateUrl: "./my-price-list.component.html",
  styleUrls: ["./my-price-list.component.scss"],
})
export class MyPriceListComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  branchId!: number;
  myPriceList: BuyPrice[] = [];
  myPriceListTemp: BuyPrice[] = [];
  initPage$ = new Subscription();
  loading = false;
  openMyPriceListFilterModal = false;
  tagList: ITag[] = [];
  changeTagList$ = new Subscription();
  removeTag$ = new Subscription();
  page = 1;
  pageSize = 10;
  cols: ICol[] = [
    {
      field: "expansionButton",
      header: dictionary.Empty,
      hasNormalRow: true,
      linkRowPermission: "ReportDetails",
      width: "auto",
      hidden: false,
    },
    {
      field: "productName",
      header: dictionary.ProductName,
      hasNormalRow: true,
      linkRowPermission: "ReportDetails",
      width: "auto",
      hidden: false,
    },
    {
      field: "priceRange",
      header: dictionary.PriceSlashRange,
      hasNormalRow: true,
      linkRowPermission: "ReportDetails",
      width: "auto",
      hidden: false,
    },
    {
      field: "discountBuyingPrice",
      header: dictionary.BuyingPrice,
      hasNormalRow: true,
      linkRowPermission: "ReportDetails",
      width: "auto",
      hidden: false,
    },
  ];
  tempCols: ICol[] = [];
  rowexpansionMyPriceListColumns: ICol[] = [];
  myPriceListFilter = new MyPriceListFilterDto();
  openMyPricesListFilterModal = false;
  currencies: Currency[] = [];
  searchCriteria: string | undefined;
  categories!: Category;
  lastPageNumber = 0;
  exportData: any[] = [];

  constructor(
    private priceListsClient: PriceListsClient,
    private coreService: CoreService,
    private currenciesClient: CurrenciesClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tagService: TagService,
    private loadingService: LoadingService,
    private titleService: Title,
    private layoutService: LayoutService,
    private priceListService: PriceListService,
    private categoriesClient: CategoriesClient
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });
    this.removeTag$ = tagService.removeTag$.subscribe((tagsKey: string) => {
      if (tagsKey == dictionary.Currency) {
        this.myPriceListFilter.currencyId = undefined;
      }
      if (tagsKey == dictionary.Category) {
        this.myPriceListFilter.categoryId = undefined;
      }
      if (tagsKey == dictionary.ProductType) {
        this.myPriceListFilter.isPhysicalProduct = undefined;
      }

      this.updateRouteParameters(this.myPriceListFilter);
      this.fillLocalMyPriceList({ page: 1, pageSize: this.pageSize });
    });
    this.rowexpansionMyPriceListColumns = this.cols.filter(
      (item) => item.field !== "expansionButton" && item.field !== "productName"
    );
  }

  ngOnInit() {
    this.tempCols = this.cols;
    const params = this.getUrlParams();
    if (params) {
      this.myPriceListFilter.init({
        currencyId: params.currencyId ? Number(params.currencyId) : undefined,
        isPhysicalProduct: params.physicalProduct,
        categoryId: params.categoryId,
        productId: undefined,
      });
    }
    this.initPage();
    this.initTitle();
  }
  initPage(): void {
    this.loading = true;
    this.initPage$ = combineLatest({
      categories: this.categoriesClient.getRootCategory(),
      myPriceList: this.priceListsClient.getBuyPrices(
        this.branchId,
        null,
        null,
        null,
        null,
        null,
        -1,
        null
      ),
      currencies: this.currenciesClient.getCurrencies(),
    }).subscribe({
      next: (res) => {
        this.initMyPriceList(res.myPriceList);
        this.currencies = res.currencies;
        this.categories = res.categories;
        this.createTagFromUrlParams();
      },
      error: (error: ResponseErrorDto) => {
        throw Error(error.message);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
  initMyPriceList(data: BuyPrice[]): void {
    this.myPriceList = data.map((price) => ({
      ...price,
      productId: price.product.productId,
      discountBuyingPrice:
        price.rules.length > 0 ? price.rules[0].priceValue * 100 - 100 : null,
    })) as any;
    this.myPriceListTemp = this.myPriceList;
    this.checkShowExpansionButtonCol(data);
    this.fillLocalMyPriceList({ page: 1, pageSize: this.pageSize });
  }

  getMyPriceList(): void {
    this.loading = true;
    this.initPage$ = this.priceListsClient
      .getBuyPrices(
        this.branchId,
        this.searchCriteria,
        this.myPriceListFilter.productId,
        this.myPriceListFilter.currencyId,
        this.myPriceListFilter.categoryId,
        this.myPriceListFilter.isPhysicalProduct,
        this.page,
        this.pageSize
      )
      .subscribe({
        next: (res) => {
          this.initMyPriceList(res);
          this.loading = false;
          this.createTagFromUrlParams();
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
      });
  }

  checkShowExpansionButtonCol(data: BuyPrice[]): void {
    let showExpansionButtonCol = false;
    this.cols = this.tempCols;
    for (let index = 0; index < data.length; index++) {
      const priceList = data[index];
      if (priceList.rules.length > 1) {
        showExpansionButtonCol = true;
        return;
      }
    }
    if (!showExpansionButtonCol) this.cols = this.cols.slice(1);
    else this.cols = this.tempCols;
  }
  initTitle() {
    this.titleService.setTitle(
      `${dictionary.MyPriceList} - ${this.layoutService.branchName}`
    );
  }

  getMaxAndMinBuyingPriceMethod(data: BuyPriceRule[], product: ProductSummary) {
    let textBuyingPrice: string;
    if (data.length > 1) {
      let maxPrice = Math.max(
        ...data.map((price) => price.buyingPriceAmount?.end!)
      );
      let minPrice = Math.min(
        ...data.map((price) => price.buyingPriceAmount?.start!)
      );
      textBuyingPrice = `${
        product.currency.symbol ? product.currency.symbol : ""
      }${this.coreService.numberWithCommas(minPrice)} ${
        !!maxPrice
          ? this.coreService.isUnlimitedNumber(maxPrice)
            ? "- ထ"
            : "- " +
              `${product.currency.symbol ? product.currency.symbol : ""}` +
              this.coreService.numberWithCommas(maxPrice)
          : ""
      }`;
    } else {
      textBuyingPrice = `${
        product.currency.symbol ? product.currency.symbol : ""
      }${this.coreService.numberWithCommas(
        data[0].buyingPriceAmount?.start!
      )} ${
        data[0].buyingPriceAmount?.end! !== null
          ? this.coreService.isUnlimitedNumber(data[0].buyingPriceAmount?.end!)
            ? "- ထ"
            : "- " +
              `${product.currency.symbol ? product.currency.symbol : ""}` +
              this.coreService.numberWithCommas(data[0].buyingPriceAmount?.end!)
          : ""
      }`;
    }
    return textBuyingPrice;
  }

  saveFilterMyPriceList(filter: IMyPriceListFilterDto): void {
    this.openMyPricesListFilterModal = false;
    this.myPriceListFilter.init(filter);
    this.updateRouteParameters(filter);
    this.fillLocalMyPriceList({ page: 1, pageSize: this.pageSize });
    const tags: IMyPriceListFilterTag = {
      categoryId: filter.categoryId,
      currencyId: String(filter.currencyId),
      physicalProduct: filter.isPhysicalProduct!,
      producId: String(filter.productId),
    };
    this.createTags(tags);
  }
  updateRouteParameters(filter: IMyPriceListFilterDto) {
    const params: Params = {
      currencyId: filter.currencyId,
      productId: filter.productId,
      categoryId: filter.categoryId,
      isPhysicalProduct: filter.isPhysicalProduct,
    };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: "merge",
    });
  }
  createTagFromUrlParams(): void {
    setTimeout(() => {
      const params = this.getUrlParams()!;
      if (params) this.createTags(params);
    }, 200);
  }
  getUrlParams(): IMyPriceListFilterTag | undefined {
    if (!location.href.includes("?")) return;
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });
    const producId = httpParams.get("productId")!;
    const currencyId = httpParams.get("currencyId")!;
    const categoryId = JSON.parse(httpParams.get("categoryId")!);
    const physicalProduct = JSON.parse(httpParams.get("isPhysicalProduct")!);

    let tags: IMyPriceListFilterTag;
    tags = {
      producId,
      currencyId,
      categoryId,
      physicalProduct,
    };

    return tags;
  }
  createTags(data: IMyPriceListFilterTag): void {
    let tags: ITag[];
    const currencyName: ITag = {
      key: dictionary.Currency,
      value: this.getTagValueCurrency(Number(data.currencyId)),
      clearable: true,
    };

    const categoryTag: ITag = {
      key: dictionary.Category,
      value: this.getCategoryTag(Number(data.categoryId)),
      clearable: true,
    };

    const physicalProduct: ITag = {
      key: dictionary.ProductType,
      value: this.getTagValueProductType(data.physicalProduct),
      clearable: true,
    };

    tags = [currencyName, categoryTag, physicalProduct];
    this.tagService.createTags(tags);
  }

  getTagValueProductType(data: any): string | undefined {
    let productTypeText: string | undefined;
    if (typeof data === "boolean") {
      productTypeText =
        data === false ? dictionary.DigitalCards : dictionary.PhysicalCards;
    } else {
      productTypeText = undefined;
    }
    return productTypeText;
  }

  getTagValueCurrency(currencyId: number): string | undefined {
    let findCurrency = this.currencies.find(
      (currency) => currency.currencyId === currencyId
    );
    return findCurrency?.currencyName;
  }

  getCategoryTag(id: number) {
    return this.priceListService.searchCategory(this.categories, id)
      ?.categoryName;
  }

  onRefreshClick(): void {
    this.initPage();
  }
  onExcelExportClick(): void {
    this.coreService.exportExcel(this.exportData, "myPriceList");
  }
  onInputSearch(query: string | undefined) {
    this.searchCriteria = query;
    this.fillLocalMyPriceList({ page: 1, pageSize: this.pageSize });
  }

  fillLocalMyPriceList(data: IPageChange): void {
    this.page = data.page;
    let temp = this.myPriceListTemp;
    this.lastPageNumber = Math.ceil(
      this.myPriceListTemp.length / this.pageSize
    );

    temp = this.search(temp, this.searchCriteria);

    temp = this.filter(temp, this.myPriceListFilter);

    this.exportData = this.getExportData(temp);

    this.myPriceList = temp.slice(
      (this.page - 1) * this.pageSize,
      this.page * this.pageSize
    );
  }
  search(data: BuyPrice[], query: string | undefined): BuyPrice[] {
    if (query) {
      data = data.filter(
        (d) =>
          d.product.productId == Number(query) ||
          d.product.productName
            .toLocaleLowerCase()
            .includes(query.toLocaleLowerCase()) ||
          d.product.providerSku
            .toLocaleLowerCase()
            .includes(query.toLocaleLowerCase()) ||
          d.product.upc?.toLocaleLowerCase().includes(query.toLocaleLowerCase())
      );
    }
    return data;
  }
  filter(data: BuyPrice[], filter: IMyPriceListFilterDto): BuyPrice[] {
    if (filter.categoryId) {
      data = data.filter(
        (d) => d.product.category.categoryId == filter.categoryId
      );
    }
    if (filter.currencyId) {
      data = data.filter(
        (d) => d.product.currency.currencyId == filter.currencyId
      );
    }
    if (filter.productId) {
      data = data.filter((d) => d.product.productId == filter.productId);
    }
    if (
      filter.isPhysicalProduct != undefined ||
      filter.isPhysicalProduct != null
    ) {
      data = data.filter(
        (d) => d.product.isPhysical == filter.isPhysicalProduct
      );
    }

    return data;
  }
  sort(event: SortEvent): BuyPrice[] | undefined {
    const field = event.field;
    return event.data?.sort((d1: any, d2: any) => {
      let result = null;

      if (field === "productName") {
        let v1 = d1.product.productName;
        let v2 = d2.product.productName;
        if (v1 == null && v2 != null) result = -1;
        else if (v1 != null && v2 == null) result = 1;
        else if (v1 == null && v2 == null) result = 0;
        else result = v1.localeCompare(v2);
      }

      if (field === "productName") {
        let v1 = d1.product.productName;
        let v2 = d2.product.productName;
        if (v1 == null && v2 != null) result = -1;
        else if (v1 != null && v2 == null) result = 1;
        else if (v1 == null && v2 == null) result = 0;
        else result = v1.localeCompare(v2);
      }

      if (field === "discountBuyingPrice") {
        let v1 = d1.discountBuyingPrice;
        let v2 = d2.discountBuyingPrice;
        if (v1 == null && v2 != null) result = -1;
        else if (v1 != null && v2 == null) result = 1;
        else if (v1 == null && v2 == null) result = 0;
        else result = v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
      }

      return event.order! * result!;
    });
  }
  getExportData(data: BuyPrice[]): any[] {
    let myPriceList: any[] = [];
    data.forEach((item) => {
      if (item.rules.length > 0) {
        item.rules.forEach((rule) => {
          myPriceList.push({
            productId: item.product.productId,
            productName: item.product.productName,
            currencyName: item.product.currency.currencyName,
            upc: item.product.upc,
            minPrice: rule.faceValue.start,
            maxPrice: rule.faceValue.end,
            minBuyingPrice: rule.consumerPriceAmount.start,
            maxBuyingPrice: rule.consumerPriceAmount.end,
            providerSku: item.product.providerSku,
            isPhysical: item.product.isPhysical,
          });
        });
      }
    });
    return myPriceList;
  }
  pageSizeChange(event: number): void {
    this.pageSize = event == 0 ? this.myPriceListTemp.length : event;
    this.fillLocalMyPriceList({
      page: 1,
      pageSize: this.pageSize,
    });
  }

  getMaxAndMinPriceRange(data: any): string {
    let textPriceRange: string;
    const rules: BuyPriceRule[] = data.rules;
    if (rules.length > 1) {
      let maxPrice = Math.max(...rules.map((rule) => rule.faceValue.end!));
      let minPrice = Math.min(...rules.map((price) => price.faceValue.start!));
      textPriceRange = `${
        data.product.currency.symbol
      }${this.coreService.numberWithCommas(minPrice)} ${
        !!maxPrice
          ? this.coreService.isUnlimitedNumber(maxPrice)
            ? "- ထ"
            : "- " +
              data.product.currency.symbol +
              this.coreService.numberWithCommas(maxPrice)
          : ""
      }`;
    } else {
      textPriceRange = `${
        data.product.currency.symbol
      }${this.coreService.numberWithCommas(rules[0]!.faceValue.start)} ${
        rules[0].faceValue.end! !== null
          ? this.coreService.isUnlimitedNumber(rules[0].faceValue.end!)
            ? "- ထ"
            : "- " +
              data.product.currency.symbol +
              this.coreService.numberWithCommas(rules[0].faceValue.end!)
          : ""
      }`;
    }
    return textPriceRange;
  }

  getMaxAndMinBuyingPrice(rules: BuyPriceRule[]): string {
    let textBuyingPrice: string;
    if (rules.length > 1) {
      let maxPrice = Math.max(
        ...rules.map((rule) => rule.consumerPriceAmount?.end!)
      );
      let minPrice = Math.min(
        ...rules.map((rule) => rule.consumerPriceAmount?.start!)
      );
      textBuyingPrice = `${this.coreService.numberWithCommas(minPrice)} ${
        !!maxPrice
          ? this.coreService.isUnlimitedNumber(maxPrice)
            ? "- ထ"
            : "- " + this.coreService.numberWithCommas(maxPrice)
          : ""
      }`;
    } else {
      textBuyingPrice = `${this.coreService.numberWithCommas(
        rules[0].consumerPriceAmount?.start!
      )} ${
        rules[0].consumerPriceAmount?.end! !== null
          ? this.coreService.isUnlimitedNumber(
              rules[0].consumerPriceAmount?.end!
            )
            ? "- ထ"
            : "- " +
              this.coreService.numberWithCommas(
                rules[0].consumerPriceAmount?.end!
              )
          : ""
      }`;
    }
    return textBuyingPrice;
  }

  getMaxAndMinSellingPrice(rules: BuyPriceRule[]): string {
    let textSellingPrice: string;
    if (rules.length > 1) {
      let maxPrice = Math.max(
        ...rules.map((rule) => rule.resellPriceAmount?.end!)
      );
      let minPrice = Math.min(
        ...rules.map((rule) => rule.resellPriceAmount?.start!)
      );
      textSellingPrice = `${this.coreService.numberWithCommas(minPrice)} ${
        !!maxPrice
          ? this.coreService.isUnlimitedNumber(maxPrice)
            ? "- ထ"
            : "- " + this.coreService.numberWithCommas(maxPrice)
          : ""
      }`;
    } else {
      textSellingPrice = `${this.coreService.numberWithCommas(
        rules[0].resellPriceAmount?.start!
      )} ${
        rules[0].resellPriceAmount?.end! !== null
          ? this.coreService.isUnlimitedNumber(rules[0].resellPriceAmount?.end!)
            ? "- ထ"
            : "- " +
              this.coreService.numberWithCommas(
                rules[0].resellPriceAmount?.end!
              )
          : ""
      }`;
    }
    return textSellingPrice;
  }

  ngOnDestroy(): void {
    this.initPage$.unsubscribe();
    this.titleService.setTitle(``);
  }
}
