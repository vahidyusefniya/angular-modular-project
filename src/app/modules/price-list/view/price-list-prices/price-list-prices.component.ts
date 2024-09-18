// noinspection JSIgnoredPromiseFromCall

import { HttpParams } from "@angular/common/http";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  IPageChange,
  ITag,
  LoadingService,
  NotificationService,
  TagService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  CategoriesClient,
  Category,
  CurrenciesClient,
  Currency,
  Price,
  PriceList,
  PriceListsClient,
  PriceResult,
  PriceRule,
  PriceView,
  ProductPriceRule,
  ProductSummary,
  ProductsClient,
} from "@app/proxy/proxy";
import { TruncateDecimalsPipe } from "@app/shared/pipes";
import { dictionary } from "@dictionary/dictionary";
import { ActionSheetController, AlertController } from "@ionic/angular";
import { CustomerService } from "@modules/customer/service/customer.service";
import { SortEvent } from "primeng/api";
import { Subscription, combineLatest } from "rxjs";
import {
  IPriceExportData,
  PriceResultDto,
  PriceViewDto,
} from "../../dto/price-list.dto";
import { PriceListService } from "../../service/price-list.service";

@Component({
  selector: "app-price-list-prices",
  templateUrl: "./price-list-prices.component.html",
  styleUrls: ["./price-list-prices.component.scss"],
})
export class PriceListPricesComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  priceView: PriceViewDto[] = [];
  priceViewTemp: PriceViewDto[] = [];
  priceViewExcelData: PriceViewDto[] = [];
  prices: PriceViewDto[] = [];
  pricesTemp: PriceViewDto[] = [];
  products: ProductSummary[] = [];
  priceValueList: PriceView[] = [];
  priceColumns: any[] = [
    {
      field: "expansionButton",
      header: dictionary.Empty,
    },
    {
      field: "productBadge",
      header: dictionary.Empty,
    },
    {
      field: "productName",
      header: dictionary.Product,
    },
    {
      field: "priceRange",
      header: dictionary.Price,
    },
    // {
    //   field: "discountBuyingPrice",
    //   header: dictionary.DiscountBuyingPrice,
    // },
    {
      field: "buyingPrice",
      header: dictionary.BuyingPrice,
    },
  ];
  columns: any[] = [
    {
      field: "expansionButton",
      header: dictionary.Empty,
    },
    {
      field: "productName",
      header: dictionary.ProductName,
    },
    {
      field: "priceRange",
      header: dictionary.Price,
    },
    {
      field: "discountBuyingPrice",
      header: dictionary.DiscountBuyingPrice,
    },
    {
      field: "buyingPrice",
      header: dictionary.BuyingPrice,
    },
  ];
  tempCols: any[] = [];
  rowexpansionPricesColumns: any[] = [];
  rowexpansionRulesColumns: any[] = [];
  loading = false;
  openCreatePriceModal = false;
  openEditPriceModal = false;
  productId: number | undefined;
  categories!: Category;
  selectedPriceRow!: Price;
  priceExportData: IPriceExportData[] = [];
  getProducts$ = new Subscription();
  deletePriceRulesByProduct$ = new Subscription();
  customerName: string | undefined;
  priceListName: string | undefined;
  branchName: string | undefined;
  title: string | undefined;
  editPriceModalTitle: string | undefined;
  page = 1;
  rulePage = 1;
  pageSize = 10;
  initPage$ = new Subscription();
  selectedPriceTab = true;
  selectedRuleTab = false;
  searchProductLoading = false;
  parentPriceListId: number;
  currencies: Currency[] = [];
  openPricesFilterModal = false;
  tagListPriceView: ITag[] = [];
  changeTagPriceViewList$ = new Subscription();
  removeTagPriceViewList$ = new Subscription();
  selectedCurrencyPriceViewListFilter: number | undefined;
  selectedCategoryPriceViewListFilter: number | undefined;
  categoryName: string | undefined;
  selectedProductTypePriceViewListFilter: boolean | undefined | null;
  openRulesFilterModal = false;
  tagListPrices: ITag[] = [];
  selectedCurrencyPricesListFilter: number | undefined;
  importBulkPricesModal = false;
  openCreatePriceModalByPricesTab = false;
  productName: string | undefined;
  parentBranchId!: number | null;
  showNewPriceButton = false;
  showImportBulkButton: boolean = false;
  searchInputPricesTabValue: string | undefined;
  searchInputRulesTabValue: string | undefined;
  selectedPriceView: PriceViewDto | undefined;
  openCreateRuleModal = false;
  openEditRuleModal = false;
  editRuleData: any;
  selectedRulesData: PriceRule[] = [];
  showRangeStartAndEndInRuleModal = true;
  setPriceRulesByProduct$ = new Subscription();
  priceRange: { start: number; end: number } | undefined = {
    start: 0,
    end: 0,
  };
  priceRangeForCreateRule: { start: number; end: number } = {
    start: 0,
    end: -1,
  };
  getRulesSub$ = new Subscription();
  lastPageNumber = 0;
  priceViewQuery: string | undefined;

  @Input() priceListId!: number;
  @Input() branchId: number | undefined;

  constructor(
    private priceListsClient: PriceListsClient,
    private productsClient: ProductsClient,
    private coreService: CoreService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private layoutService: LayoutService,
    private titleService: Title,
    private router: Router,
    private currenciesClient: CurrenciesClient,
    private tagService: TagService,
    private actionSheetCtrl: ActionSheetController,
    private customerService: CustomerService,
    private priceListService: PriceListService,
    private categoriesClient: CategoriesClient,
    private truncateDecimalsPipe: TruncateDecimalsPipe
  ) {
    if (this.router.url.includes("customers")) {
      this.priceListId =
        this.customerService.branch?.middlePriceList?.priceListId!;
      this.customerName = this.customerService.branch?.merchantName;
      this.priceListName =
        this.customerService.branch?.middlePriceList?.priceListName!;
      this.branchName = this.customerService.branch?.branchName;
    } else {
      this.activatedRoute.queryParams.subscribe((params) => {
        this.priceListId = params["id"];
        this.customerName = params["customer"];
        this.priceListName = params["priceList"];
        this.branchName = params["branch"];
      });
      if (this.customerName && this.priceListName) {
        this.title = `Add exception for "${this.customerName}" to "${this.priceListName}"`;
      }
    }

    this.parentPriceListId = this.layoutService.getParentPriceListId();
    this.changeTagPriceViewList$ = tagService.changeTagList.subscribe(
      (tags: ITag[]) => {
        if (this.selectedPriceTab) {
          this.tagListPriceView = tags;
        } else {
          this.tagListPrices = tags;
        }
      }
    );
    this.removeTagPriceViewList$ = tagService.removeTag$.subscribe(
      (tagKey: string) => {
        if (tagKey === dictionary.Currency) {
          this.selectedCurrencyPriceViewListFilter = undefined;
        }
        if (tagKey === dictionary.Category) {
          this.selectedCategoryPriceViewListFilter = undefined;
        }
        if (tagKey === dictionary.ProductType) {
          this.selectedProductTypePriceViewListFilter = undefined;
        }
        this.updateRouteParameters({
          categoryId: this.selectedCategoryPriceViewListFilter,
          currencyId: this.selectedCurrencyPriceViewListFilter,
          productType: this.selectedProductTypePriceViewListFilter,
        });

        this.fillLocalPriceViews(
          { page: 1, pageSize: this.pageSize },
          this.priceViewQuery
        );
      }
    );

    this.parentBranchId = this.layoutService.getParentBranchId();
    this.showNewPriceButton = this.router.url.includes("/products");
    this.showImportBulkButton = this.router.url.includes(
      "/customer-price-list"
    );
  }

  ngOnInit() {
    const params = this.getUrlParams();
    if (!this.branchId) {
      this.branchId = this.coreService.getBranchId();
    }
    if (params) {
      this.selectedCategoryPriceViewListFilter = JSON.parse(
        params["categoryId"]
      );
      this.selectedCurrencyPriceViewListFilter = JSON.parse(
        params["currencyId"]
      );
      this.selectedProductTypePriceViewListFilter = JSON.parse(
        params["productType"]
      );
    }
    this.initColumns();
    this.initPage();
  }

  getUrlParams() {
    if (!location.href.includes("?")) return;
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });
    const currencyId = httpParams.get("currencyId")!;
    const categoryId = httpParams.get("categoryId")!;
    const productType = httpParams.get("productType")!;

    let tags;
    tags = {
      currencyId,
      categoryId,
      productType,
    };

    return tags;
  }

  initColumns(): void {
    this.priceColumns = [
      ...this.priceColumns,
      {
        field: "sellingPrice",
        header: dictionary.SellingPrice,
      },
      {
        field: "isActive",
        header: dictionary.Status,
      },
      {
        field: "edit-action",
        header: dictionary.Exception,
      },
      {
        field: "delete-action",
        header: dictionary.Empty,
      },
      {
        field: "error",
        header: dictionary.Empty,
      },
    ];

    this.columns = [
      ...this.columns,
      {
        field: "sellingPrice",
        header: dictionary.SellingPrice,
      },
      {
        field: "isActive",
        header: dictionary.Status,
      },
      {
        field: "error",
        header: dictionary.Empty,
      },
      {
        field: "delete-action",
        header: dictionary.Empty,
      },
    ];
    this.rowexpansionPricesColumns = this.priceColumns.filter(
      (item) =>
        item.field !== "expansionButton" &&
        item.field !== "productName" &&
        item.field !== "error" &&
        item.field !== "delete-action"
    );

    this.rowexpansionRulesColumns = this.columns.filter(
      (item) =>
        item.field !== "expansionButton" &&
        item.field !== "productName" &&
        item.field !== "delete-action" &&
        item.field !== "error"
    );
  }

  initPage() {
    this.loading = true;
    this.initPage$ = combineLatest({
      priceList: this.priceListsClient.get(this.branchId!, this.priceListId),
      pricesView: this.priceListsClient.getPriceViews(
        this.branchId!,
        this.priceListId,
        this.searchInputPricesTabValue,
        this.selectedCurrencyPriceViewListFilter,
        this.selectedCategoryPriceViewListFilter,
        this.selectedProductTypePriceViewListFilter
      ),
      categories: this.categoriesClient.getRootCategory(),
      currencies: this.currenciesClient.getCurrencies(),
    }).subscribe({
      next: (res) => {
        this.initPriceList(res.priceList);
        this.initPricesView(res.pricesView);
        this.initCurrencies(res.currencies);
        this.categories = res.categories;
        if (this.selectedCategoryPriceViewListFilter)
          this.categoryName = this.getCategoryTag(
            this.selectedCategoryPriceViewListFilter
          );
        this.loading = false;
        this.createTag({
          currencyId: this.selectedCurrencyPriceViewListFilter!,
          productType: this.selectedProductTypePriceViewListFilter!,
          categoryId: this.selectedCategoryPriceViewListFilter!,
        });
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        throw Error(error.message);
      },
    });
  }
  initCurrencies(currencies: Currency[]): void {
    this.currencies = currencies;
  }
  initBreadcrumb(priceList: PriceList) {
    if (this.router.url.includes("price-lists")) {
      if (this.branchName) {
        this.layoutService.setBreadcrumbVariable(
          `price list ${this.branchName} (${priceList.parentPriceList?.priceListName})`
        );
        this.layoutService.setBreadcrumbs([
          {
            url: `/${this.branchId}/offices`,
            deActive: false,
            label: dictionary.Offices,
          },
          {
            url: "add_exception",
            deActive: false,
            label: dictionary.AddException,
          },
        ]);
      } else {
        this.layoutService.setBreadcrumbVariable(`${priceList.priceListName}`);
        this.layoutService.setBreadcrumbs([
          {
            url: undefined,
            deActive: false,
            label: dictionary.PriceList,
          },
          {
            url: `/branches/${this.branchId}/price-lists/customer-price-lists`,
            deActive: false,
            label: dictionary.CustomerPriceList,
          },
          {
            url: `/branches/${this.branchId}/price-lists/customer-price-lists`,
            deActive: false,
            label: dictionary.Prices,
          },
        ]);
      }
    }
  }
  initTitle(priceList: PriceList) {
    if (this.router.url.includes("price-lists")) {
      if (this.branchName) {
        this.titleService.setTitle(
          `Add exception price list ${this.branchName} (${priceList.parentPriceList?.priceListName}) - Branch - ${this.layoutService.branchName}`
        );
      } else {
        this.titleService.setTitle(
          `${priceList.priceListName} (${this.priceListId}) - ${dictionary.CustomerPriceList} - ${this.layoutService.branchName}`
        );
      }
    }
  }
  initPrices(res: PriceView[]): void {
    this.prices = [];
    res.forEach((data, index) => {
      this.prices.push({
        id: index,
        productId: data.price.product.productId,
        price: data.price,
        priceResults: this.initPriceResult(
          data.priceResults,
          data.price.currency,
          data
        ),
      });
    });
    this.pricesTemp = this.prices;
  }
  initPricesView(res: PriceView[]): void {
    this.priceView = [];
    res.forEach((data, index) => {
      this.priceView.push({
        id: index,
        productId: data.price.product.productId,
        price: data.price,
        priceResults: this.initPriceResult(
          data.priceResults,
          data.price.currency,
          data
        ),
      });
    });
    this.priceViewTemp = this.priceView;
    this.fillLocalPriceViews(
      { page: this.page, pageSize: this.pageSize },
      this.priceViewQuery
    );
  }
  initPriceResult(
    data: PriceResult[],
    currency: Currency,
    priceView: PriceView
  ): PriceResultDto[] {
    let priceResult: PriceResultDto[] = [];
    data.forEach((result) => {
      priceResult.push({
        buyingRule: result.buyingRule!,
        masterRule: result.masterRule!,
        rule: result.rule,
        masterPriceAmount: result.resellPriceAmount!,
        buyingPriceAmount: result.buyingPriceAmount!,
        resellPriceAmount: result.resellPriceAmount!,
        consumerPriceAmount: result.consumerPriceAmount!,
        benefit: result.benefit!,
        errors: result.errors,
        priceRange: `${currency.symbol}${this.coreService.numberWithCommas(
          result.rule!.faceValue.start
        )} ${
          result.rule!.faceValue.end! !== null
            ? this.coreService.isUnlimitedNumber(result.rule!.faceValue.end!)
              ? "- ထ"
              : "- " +
                `${currency.symbol}` +
                this.coreService.numberWithCommas(result.rule!.faceValue.end!)
            : ""
        }`,
        discountBuyingPrice: result.buyingRule?.priceValue! * 100 - 100,
        buyingPrice: `${currency.symbol}${this.coreService.numberWithCommas(
          result.buyingPriceAmount?.start!
        )} ${
          result.buyingPriceAmount?.end! !== null
            ? this.coreService.isUnlimitedNumber(result.buyingPriceAmount?.end!)
              ? "- ထ"
              : "- " +
                `${currency.symbol}` +
                this.coreService.numberWithCommas(
                  result.buyingPriceAmount?.end!
                )
            : ""
        }`,

        discountSellingPrice: this.calcDiscountSellingPrice(
          priceView,
          result.rule?.priceValue! * 100 - 100
        ),
        sellingPrice: `${currency.symbol}${this.coreService.numberWithCommas(
          result.resellPriceAmount?.start!
        )} ${
          result.resellPriceAmount?.end! !== null
            ? this.coreService.isUnlimitedNumber(result.resellPriceAmount?.end!)
              ? "- ထ"
              : "- " +
                currency.symbol +
                this.coreService.numberWithCommas(
                  result.resellPriceAmount?.end!
                )
            : ""
        }`,
        currency: currency.currencyName,
      });
    });

    return priceResult;
  }
  calcDiscountSellingPrice(
    priceView: PriceView,
    price: number
  ): number | undefined {
    let priceValue = 0;
    const rules = priceView.price.rules;
    if (rules.length == 0) return undefined;
    rules.forEach((rule: PriceRule) => {
      if (rule.faceValue.end === -1 && rule.faceValue.start === 0) {
        priceValue =
          rule.priceValueMode === 1
            ? rule.priceValue! * 100
            : rule.priceValue! * 100 - 100;
      } else priceValue = price;
    });

    return priceValue;
  }

  updateRouteParameters(data: any) {
    const params: Params = {
      currencyId: data.currencyId,
      productType: data.productType,
      categoryId: data.categoryId,
    };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: "merge",
    });
  }

  initPriceList(res: PriceList): void {
    this.initBreadcrumb(res);
    this.initTitle(res);
  }
  onNewPriceClick(): void {
    this.productId = undefined;
    this.productName = undefined;
    this.openCreatePriceModalByPricesTab = false;
    this.getProducts(null, 1, 10);
  }
  getProducts(
    searchCriteria: string | null,
    pageNumber: number | null,
    pageSize: number | null
  ): void {
    this.searchProductLoading = true;
    this.getProducts$ = this.productsClient
      .getProducts(searchCriteria, null, null, pageNumber, pageSize)
      .subscribe({
        next: (res: ProductSummary[]) => {
          this.products = res;
        },
        error: (error: ResponseErrorDto) => {
          this.searchProductLoading = false;
          throw Error(error.message);
        },
        complete: () => {
          this.openCreatePriceModal = true;
          this.searchProductLoading = false;
        },
      });
  }
  newPrice(data: PriceView): void {
    this.openCreatePriceModal = false;
    this.searchInputRulesTabValue = undefined;
    this.updateLocalPriceView(data);
    this.notificationService.showSuccessNotification(
      `Added ${this.selectedRuleTab ? "rule" : "price"} for product "${
        data.price.product.productName
      }" successfully`
    );
  }
  onEditPriceClick(priceView: PriceViewDto): void {
    this.selectedPriceView = priceView;
    this.editPriceModalTitle = `Edit price for "${priceView.price.product.productName}"`;
    this.productId = priceView.price.product.productId;
    this.priceRange = {
      start: Math.min(
        ...priceView.priceResults.map((price) => price.rule.faceValue.start!)
      ),
      end: Math.max(
        ...priceView.priceResults.map((price) => price.rule.faceValue.end!)
      ),
    };
    if (priceView.price.rules.length > 0) {
      this.findPriceByProductId(priceView.price.product.productId);
    } else {
      this.openCreatePriceModal = true;
      this.openCreatePriceModalByPricesTab = true;
      this.productName = priceView.price.product.productName!;
    }
  }
  findPriceByProductId(productId: number): void {
    this.loadingService.present();
    this.getRulesSub$ = this.priceListsClient
      .getPriceRulesByProduct(this.branchId!, this.priceListId, productId)
      .subscribe({
        next: (res: Price) => {
          this.selectedPriceRow = res;
          this.openEditPriceModal = true;
          this.loadingService.dismiss();
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }
  onProductNameClick(priceView: PriceViewDto) {
    let isEdit: any = undefined;
    isEdit = priceView.price.rules.find(
      (item) => item.faceValue.end === -1 && item.faceValue.start === 0
    );
    this.productId = priceView.price.product.productId;
    this.productName = priceView.price.product.productName!;
    this.selectedRulesData = priceView.price.rules;
    this.selectedPriceView = priceView;
    this.showRangeStartAndEndInRuleModal = false;
    if (isEdit) {
      let editRule = JSON.parse(JSON.stringify(isEdit));
      editRule.priceValue =
        editRule.priceValueMode === 0
          ? editRule.priceValue! * 100 - 100
          : editRule.priceValue! * 100;
      this.editRuleData = editRule;
      this.openEditRuleModal = true;
    } else {
      this.openCreateRuleModal = true;
    }
  }
  editPrice(data: PriceView): void {
    this.openEditPriceModal = false;
    this.searchInputRulesTabValue = undefined;
    this.updateLocalPriceView(data);
    this.notificationService.showSuccessNotification(
      `Edit ${this.selectedRuleTab ? "rule" : "price"} for product "${
        data.price.product.productName
      }" successfully`
    );
  }
  async onRemovePriceClick(data: PriceViewDto, expanded: boolean) {
    this.rowexpansionButtonClick(data, expanded);

    this.selectedPriceView = data;
    const removeAlert = await this.alertController.create({
      header: this.selectedRuleTab
        ? dictionary.DeleteRule
        : dictionary.DeletePrice,
      message: `Are you sure delete ${
        this.selectedRuleTab ? "rule" : "price"
      } for product <b>${data.price.product.productName}</b>?`,
      animated: false,
      cssClass: "deletePrice__alert",
      buttons: [
        {
          text: dictionary.Cancel,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
        {
          text: dictionary.Delete,
          role: "confirm",
          cssClass: "danger-alert-btn",
          handler: () => {
            this.removePrice(data);
          },
        },
      ],
    });

    await removeAlert.present();
  }
  removePrice(data: PriceViewDto): void {
    this.loadingService.present();
    this.deletePriceRulesByProduct$ = this.priceListsClient
      .deletePriceRulesByProduct(
        this.branchId!,
        this.priceListId,
        data.price.product.productId!
      )
      .subscribe({
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
        complete: () => {
          this.updatePriceView(data);
          this.notificationService.showSuccessNotification(
            `Delete ${this.selectedRuleTab ? "rule" : "price"} for product "${
              data.price.product.productName
            }" successfully`
          );
        },
      });
  }
  updatePriceView(data: PriceViewDto): void {
    const me = this;
    this.priceListsClient
      .getPriceView(
        this.branchId!,
        this.priceListId,
        data.price.product.productId
      )
      .subscribe({
        next(res: PriceView) {
          me.updateLocalPriceView(res);
          me.loadingService.dismiss();
        },
        error: (error: ResponseErrorDto) => {
          me.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  rowexpansionButtonClick(data: PriceViewDto, expanded: boolean): void {
    if (expanded) document.getElementById(`${data.id}`)?.click();
  }
  onRefreshClick(): void {
    this.page = 1;
    this.fillPriceViews();
  }
  onExcelExportPriceListClick(status: string) {
    this.onExcelExport(this.priceViewExcelData, status);
  }
  onExcelExport(priceView: PriceViewDto[], status?: string): void {
    this.priceExportData = [];

    if (status !== "bulk") {
      priceView.forEach((data) => {
        data.priceResults.forEach((result) => {
          this.priceExportData.push({
            productId: data.price.product.productId,
            productName: data.price.product.productName!,
            minPriceRange:
              result.rule !== null
                ? `${this.coreService.numberWithCommas(
                    result.rule!.faceValue.start
                  )}`
                : "-",
            maxPriceRange:
              result.rule !== null
                ? `${this.coreService.numberWithCommas(
                    result.rule!.faceValue.end!
                  )}`
                : "-",
            minBuyingPrice:
              result.buyingRule !== null
                ? `${this.coreService.numberWithCommas(
                    result.buyingPriceAmount!.start
                  )}`
                : "-",
            maxBuyingPrice:
              result.buyingRule !== null
                ? `${this.coreService.numberWithCommas(
                    result.buyingPriceAmount!.end!
                  )}`
                : "-",
            discountSellingPrice:
              data.price.rules.length === 0
                ? undefined
                : result.rule !== null
                ? (this.truncateDecimalsPipe.transform(
                    result.rule?.priceValue! * 100 - 100
                  ) as any)
                : 0,
            minSellingPrice:
              result.resellPriceAmount !== null
                ? `${this.coreService.numberWithCommas(
                    result.resellPriceAmount?.start!
                  )}`
                : "-",
            maxSellingPrice:
              result.resellPriceAmount !== null
                ? `${this.coreService.numberWithCommas(
                    result.resellPriceAmount?.end!
                  )}`
                : "-",
            discountBuyingPrice:
              result.buyingRule !== null
                ? (this.truncateDecimalsPipe.transform(
                    result.buyingRule?.priceValue! * 100 - 100
                  ) as any)
                : 0,
            currencyId: data.price.currency.currencyId,
            currencyName: data.price.currency.currencyName,
            regionId: data.price.regions?.length
              ? data.price.regions[0].regionId ?? undefined
              : undefined,
            regionName: data.price.regions?.length
              ? data.price.regions[0].name ?? undefined
              : undefined,
            consumerFee: result.rule.consumerFee!,
            consumerTax: result.rule.consumerTax!,
            isActive: result.rule.isActive!,
            isPhysical: data.price.product.isPhysical,
            providerSku: data.price.product.providerSku,
            error: result.errors[0]?.message,
          });
        });
      });
    } else {
      priceView.forEach((data) => {
        data.priceResults.forEach((result) => {
          this.priceExportData.push({
            productId: data.price.product.productId,
            productName: data.price.product.productName!,
            currencyId: data.price.currency.currencyId,
            currencyName: data.price.currency.currencyName,
            minPriceRange:
              result.rule !== null
                ? `${this.coreService.numberWithCommas(
                    result.rule!.faceValue.start
                  )}`
                : "-",
            maxPriceRange:
              result.rule !== null
                ? `${this.coreService.numberWithCommas(
                    result.rule!.faceValue.end!
                  )}`
                : "-",
            sellingMargin:
              data.price.rules.length === 0
                ? undefined
                : result.rule !== null
                ? result.rule?.priceValue! * 100 - 100
                : 0,
            isPhysical: data.price.product.isPhysical,
            discountBuyingPrice:
              result.buyingRule !== null
                ? (this.truncateDecimalsPipe.transform(
                    result.buyingRule?.priceValue! * 100 - 100
                  ) as any)
                : 0,
            providerSku: data.price.product.providerSku,
            regionId: data.price.regions?.length
              ? data.price.regions[0].regionId ?? undefined
              : undefined,
            regionName: data.price.regions?.length
              ? data.price.regions[0].name ?? undefined
              : undefined,
            isActive: result.rule.isActive!,
          });
        });
      });
    }

    this.coreService.exportExcel(this.priceExportData, "prices");
  }

  fillLocalPriceViews(data: IPageChange, query: string | undefined): void {
    this.priceViewQuery = query;
    this.page = data.page;
    let temp = this.priceViewTemp;
    this.lastPageNumber = Math.ceil(this.priceViewTemp.length / this.pageSize);

    temp = this.search(this.priceViewTemp, query);

    temp = this.filter(
      temp,
      this.selectedCurrencyPriceViewListFilter,
      this.selectedProductTypePriceViewListFilter,
      this.selectedCategoryPriceViewListFilter
    );

    this.priceViewExcelData = temp;

    this.priceView = temp.slice(
      (this.page - 1) * this.pageSize,
      this.page * this.pageSize
    );
    this.checkShowExpansionAndErrorCols(this.priceView);
  }
  search(data: PriceViewDto[], query: string | undefined): PriceViewDto[] {
    if (!query) return data;
    return data.filter(
      (d) =>
        d.productId == Number(query) ||
        d.price.product.productName
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()) ||
        d.price.product.providerSku
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase())
    );
  }
  filter(
    data: PriceViewDto[],
    currencyId: number | undefined,
    productType: boolean | undefined | null,
    categoryId: Number | undefined
  ): PriceViewDto[] {
    if (!!currencyId) {
      data = data.filter((d) => d.price.currency.currencyId == currencyId);
    }
    if (productType !== null && productType !== undefined) {
      data = data.filter((d) => d.price.product.isPhysical == productType);
    }
    if (!!categoryId) {
      data = data.filter(
        (d) => d.price.product.category.categoryId == categoryId
      );
    }

    return data;
  }
  sort(event: SortEvent): PriceViewDto[] | undefined {
    const field = event.field;
    return event.data?.sort((d1: PriceViewDto, d2: PriceViewDto) => {
      let result = null;

      if (field === "productName") {
        let v1 = d1.price.product.productName;
        let v2 = d2.price.product.productName;

        result = v1.localeCompare(v2);
      }

      if (field === "buyingPrice") {
        let v1 = d1.priceResults[0].discountBuyingPrice!;
        let v2 = d2.priceResults[0].discountBuyingPrice!;

        if (v1 == null && v2 != null) result = -1;
        else if (v1 != null && v2 == null) result = 1;
        else if (v1 == null && v2 == null) result = 0;
        else if (typeof v1 == "number" && typeof v2 == "number")
          result = v2 - v1;
        else result = v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
      }

      if (field === "sellingPrice") {
        let v1 = d1.priceResults[0].discountSellingPrice
          ? d1.priceResults[0].discountSellingPrice
          : null;
        let v2 = d2.priceResults[0].discountSellingPrice
          ? d2.priceResults[0].discountSellingPrice
          : null;

        if (v1 == null && v2 != null) result = -1;
        else if (v1 != null && v2 == null) result = 1;
        else if (v1 == null && v2 == null) result = 0;
        else if (typeof v1 == "number" && typeof v2 == "number")
          result = v2 - v1;
        else result = v1! < v2! ? -1 : v1! > v2! ? 1 : 0;
      }

      return event.order! * result!;
    });
  }
  pageSizeChange(event: number): void {
    this.pageSize = event == 0 ? this.priceViewTemp.length : event;
    this.fillLocalPriceViews(
      {
        page: 1,
        pageSize: this.pageSize,
      },
      this.priceViewQuery
    );
  }

  checkShowExpansionAndErrorCols(data: PriceViewDto[]): void {
    this.tempCols = this.priceColumns;
    let showExpansionButtonCol = false;
    let showError = false;
    let showDelete = false;
    for (let index = 0; index < data.length; index++) {
      const priceList = data[index];
      if (priceList.priceResults.length > 1) {
        showExpansionButtonCol = true;
      }
      if (priceList.priceResults[0].errors.length > 0) {
        showError = true;
      }
      if (priceList.price.rules.length > 0) {
        showDelete = true;
      }
    }

    if (!showExpansionButtonCol) {
      this.priceColumns = this.priceColumns.filter(
        (p) => p.field !== "expansionButton"
      );
    }
    if (!showError) {
      this.priceColumns = this.priceColumns.filter((p) => p.field !== "error");
    }
    if (showExpansionButtonCol) {
      const checkExpansionCol = this.priceColumns.find(
        (p) => p.field === "expansionButton"
      );
      if (!checkExpansionCol) {
        this.priceColumns.unshift({
          field: "expansionButton",
          header: dictionary.Empty,
        });
      }
    }
    if (showError) {
      const checkErrorCol = this.priceColumns.find((p) => p.field === "error");
      if (!checkErrorCol) {
        this.priceColumns.push({
          field: "error",
          header: dictionary.Empty,
        });
      }
    }
    if (!showDelete) {
      this.priceColumns = this.priceColumns.filter(
        (p) => p.field !== "delete-action"
      );
    }
    if (showDelete) {
      const checkErrorCol = this.priceColumns.find(
        (p) => p.field === "delete-action"
      );
      if (!checkErrorCol) {
        this.priceColumns.push({
          field: "delete-action",
          header: dictionary.Empty,
        });
      }
    }
  }

  fillPriceViews(): void {
    this.loading = true;
    this.priceListsClient
      .getPriceViews(
        this.branchId!,
        this.priceListId,
        this.searchInputPricesTabValue,
        this.selectedCurrencyPriceViewListFilter,
        this.selectedCategoryPriceViewListFilter,
        this.selectedProductTypePriceViewListFilter
      )
      .subscribe({
        next: (res: PriceView[]) => {
          this.loading = false;
          this.initPricesView(res);
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
      });
  }
  pageRuleListChanged(data: IPageChange): void {
    this.rulePage = data.page;
    this.fillRules();
  }
  fillRules(): void {
    this.loading = true;
    this.priceListsClient
      .getPrices(
        this.branchId!,
        this.priceListId,
        this.searchInputRulesTabValue,
        this.selectedCurrencyPricesListFilter,
        this.rulePage,
        this.pageSize
      )
      .subscribe({
        next: (res: PriceView[]) => {
          this.loading = false;
          this.initPrices(res);
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
      });
  }

  searchProduct(event: any) {
    this.products = [];
    if (!event) {
      this.getProducts(null, 1, 10);
    } else {
      this.getProducts(event, -1, null);
    }
  }

  saveFilterPrices({
    currencyId,
    productType,
    category,
  }: {
    currencyId: number;
    productType: boolean | null | undefined;
    category: Category;
  }) {
    this.selectedCurrencyPriceViewListFilter = currencyId;
    this.selectedProductTypePriceViewListFilter = productType;
    this.selectedCategoryPriceViewListFilter = category.categoryId;
    this.categoryName = category.categoryName;
    this.openPricesFilterModal = false;
    this.updateRouteParameters({
      currencyId,
      productType,
      categoryId: this.selectedCategoryPriceViewListFilter,
    });
    this.createTag({
      currencyId,
      productType,
      categoryId: this.selectedCategoryPriceViewListFilter,
    });
    this.page = 1;
    this.fillLocalPriceViews(
      { page: 1, pageSize: this.pageSize },
      this.priceViewQuery
    );
  }

  createTag({
    currencyId,
    productType,
    categoryId,
  }: {
    currencyId: number;
    categoryId: number;
    productType: boolean | null | undefined;
  }): void {
    this.tagService.createTags([
      {
        clearable: true,
        key: dictionary.Currency,
        value: this.getTagValueCurrency(currencyId),
      },
      {
        clearable: true,
        key: dictionary.Category,
        value: this.getCategoryTag(categoryId),
      },
      {
        clearable: true,
        key: dictionary.ProductType,
        value:
          productType != null
            ? productType
              ? dictionary.PhysicalCards
              : dictionary.DigitalCards
            : "",
      },
    ]);
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

  saveFilterRules(currencyId: number) {
    this.selectedCurrencyPricesListFilter = currencyId;
    this.openRulesFilterModal = false;
    this.createTag({
      currencyId: currencyId,
      productType: this.selectedProductTypePriceViewListFilter,
      categoryId: this.selectedCategoryPriceViewListFilter!,
    });
    this.page = 1;
    this.fillRules();
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: this.initActionSheetItems(),
    });

    await actionSheet.present();
  }
  initActionSheetItems(): any[] {
    const items: any = [
      {
        id: 1,
        text: dictionary.ImportBulkPrices,
        handler: () => {
          this.onImportBulkPricesClick();
        },
      },
      {
        id: "new-price",
        text: dictionary.NewPrice,
        handler: () => {
          this.onNewPriceClick();
        },
      },
      {
        id: "advance-filter",
        text: dictionary.AdvanceFilter,
        handler: () => {
          this.openPricesFilterModal = true;
        },
      },
      {
        id: 4,
        text: dictionary.Cancel,
        role: "cancel",
        data: {
          action: "cancel",
        },
      },
    ];
    const permissions: string[] = this.layoutService.getPermissions();
    const hasNewPricePricesPermission = permissions.find(
      (p) => p === "PriceListWrite"
    );
    const hasImportBulkPricesPermission = permissions.find(
      (p) => p === "PriceListWrite"
    );
    if (
      !hasNewPricePricesPermission ||
      !this.parentBranchId ||
      !this.showNewPriceButton
    ) {
      const index = items.findIndex((i: any) => i.id === "new-price");
      if (index > -1) items.splice(index, 1);
    }
    if (!hasImportBulkPricesPermission) {
      const index = items.findIndex((i: any) => i.id === 1);
      if (index > -1) items.splice(index, 1);
    }

    return items;
  }
  onImportBulkPricesClick(): void {
    this.loadingService.present();
    this.getProducts$ = this.priceListsClient
      .getPriceViews(this.branchId!, this.priceListId, null, null, null, null)
      .subscribe({
        next: (res: PriceView[]) => {
          this.priceValueList = res;
          this.priceValueList.map((item) =>
            this.products.push(item.price.product)
          );
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
        complete: () => {
          this.loadingService.dismiss();
          this.importBulkPricesModal = true;
        },
      });
  }
  importBulkPrices(data: ProductPriceRule[]): void {
    this.loadingService.present();
    this.importBulkPricesModal = false;
    this.priceListsClient
      .setPrices(this.branchId!, this.priceListId, data)
      .subscribe({
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
        complete: () => {
          this.loadingService.dismiss();
          this.notificationService.showSuccessNotification(
            `${dictionary.ImportBulkPrices}  successfully`
          );
          this.onRefreshClick();
        },
      });
  }

  async onShowErrorPriceViewClick(priceView: PriceView) {
    let message = priceView.priceResults[0].errors[0].message;
    const alert = await this.alertController.create({
      header: dictionary.Error,
      message: `${message}`,
      animated: false,
      cssClass: "duplicateCode__alert",
      buttons: [
        {
          text: dictionary.Close,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
      ],
    });
    await alert.present();
  }

  serachInputRulesTab(query: string) {
    if (!query) {
      this.rulePage = 1;
      this.searchInputRulesTabValue = undefined;
    } else {
      this.rulePage = 1;
      this.searchInputRulesTabValue = query;
    }
    this.fillRules();
  }

  getMaxAndMinPriceRange(data: PriceResult[], price: Price): string {
    return this.priceListService.getMaxAndMinPriceRange(data, price);
  }

  getMaxAndMinBuyingPrice(data: PriceResult[], price: Price) {
    return this.priceListService.getMaxAndMinBuyingPrice(data, price);
  }

  getMaxAndMinSellingPrice(data: PriceResult[], price: Price) {
    return this.priceListService.getMaxAndMinSellingPrice(data, price);
  }

  addRuleEvent(rule: any): void {
    rule.priceValue =
      rule.priceValueMode === 0
        ? (rule.priceValue + 100) / 100
        : rule.priceValue / 100;
    this.selectedRulesData.push(rule);
    this.setPriceRulesByProductWithPreviewTrue("addRule");
  }

  editRuleEvent(rule: any): void {
    rule.priceValue =
      rule.priceValueMode === 0
        ? (rule.priceValue + 100) / 100
        : rule.priceValue / 100;
    this.selectedRulesData.splice(
      this.selectedRulesData.findIndex(
        (item) => item.faceValue.end === -1 && item.faceValue.start === 0
      ),
      1
    );
    this.selectedRulesData.push(rule);
    this.setPriceRulesByProductWithPreviewTrue("editRule");
  }
  setPriceRulesByProductWithPreviewTrue(
    typeEvent: "addRule" | "editRule"
  ): void {
    this.loadingService.present();
    this.setPriceRulesByProduct$ = this.priceListsClient
      .setPriceRulesByProduct(
        this.branchId!,
        this.priceListId,
        this.productId!,
        this.selectedRulesData,
        true
      )
      .subscribe({
        next: (res: PriceView) => {
          if (!res.priceResults.some((item) => item.errors?.length > 0)) {
            this.setPriceRulesByProductWithPreviewFalse(typeEvent);
          } else {
            const index = this.priceView.findIndex(
              (p) => (p.price.product.productId = res.price.product.productId)
            );
            if (index == -1) return;
            this.priceView[index].price.rules = res.price.rules;
            this.priceViewTemp[index] = this.priceView[index];
            this.notificationService.showErrorAlertNotification(
              res.priceResults.find((item) => item.errors?.length > 0)
                ?.errors[0].message!
            );
            this.loadingService.dismiss();
          }
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  setPriceRulesByProductWithPreviewFalse(
    typeEvent: "addRule" | "editRule"
  ): void {
    this.loadingService.present();
    this.setPriceRulesByProduct$ = this.priceListsClient
      .setPriceRulesByProduct(
        this.branchId!,
        this.priceListId,
        this.productId!,
        this.selectedRulesData,
        false
      )
      .subscribe({
        next: (res: PriceView) => {
          this.updateLocalPriceView(res);
          this.notificationService.showSuccessNotification(
            `${
              typeEvent === "addRule"
                ? dictionary.PriceAdded
                : dictionary.PriceEdited
            }`
          );
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
        complete: () => {
          this.loadingService.dismiss();
        },
      });
  }
  updateLocalPriceView(priceView: PriceView): void {
    const index = this.priceView.findIndex(
      (p) => p.id == this.selectedPriceView?.id
    );
    const tempIndex = this.priceViewTemp.findIndex(
      (p) => p.id == this.selectedPriceView?.id
    );
    if (index == -1) return;
    this.priceView[index] = {
      id: this.priceView[index].id,
      price: priceView.price,
      priceResults: this.initPriceResult(
        priceView.priceResults,
        priceView.price.currency,
        priceView
      ),
      productId: priceView.price.product.productId,
    };

    if (tempIndex == -1) return;
    this.priceViewTemp[index] = {
      id: this.priceViewTemp[index].id,
      price: priceView.price,
      priceResults: this.initPriceResult(
        priceView.priceResults,
        priceView.price.currency,
        priceView
      ),
      productId: priceView.price.product.productId,
    };

    this.checkShowExpansionAndErrorCols(this.priceView);
  }

  dismissPriceCreateModal() {
    this.openCreatePriceModal = false;
    this.priceRange = undefined;
  }

  dismissPriceEditModal() {
    this.openEditPriceModal = false;
    this.priceRange = undefined;
  }

  ngOnDestroy(): void {
    this.tagService.tagList = [];
    this.changeTagPriceViewList$.unsubscribe();
    this.removeTagPriceViewList$.unsubscribe();
    this.initPage$.unsubscribe();
    this.getProducts$.unsubscribe();
    this.deletePriceRulesByProduct$.unsubscribe();
    this.layoutService.setBreadcrumbVariable("");
    this.layoutService.setBreadcrumbs([]);
    this.getRulesSub$.unsubscribe();
    this.setPriceRulesByProduct$.unsubscribe();
  }
}
