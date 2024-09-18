// noinspection JSIgnoredPromiseFromCall,ES6MissingAwait,DuplicatedCode

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
  NotificationService,
  TagService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  CurrenciesClient,
  Currency,
  PriceListsClient,
  ProductItem,
  ProductSummary,
  ProductsClient,
} from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { AlertController } from "@ionic/angular";
import {
  AvailableItemsFilterDto,
  AvailableItemsFilterRequestDto,
  IAvailableItemsTags,
} from "@modules/inventories/dto/Inventories.dto";
import { Subscription, combineLatest } from "rxjs";

@Component({
  selector: "app-available-items",
  templateUrl: "./available-items.component.html",
  styleUrls: ["./available-items.component.scss"],
})
export class AvailableItemsComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  loading = false;
  getInventories$ = new Subscription();
  createProductItemOrder$ = new Subscription();
  cols: ICol[] = [
    {
      field: "productId",
      header: dictionary.ProductId,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
    {
      field: "productNameFaceValueCurrencyName",
      header: dictionary.Item,
      hasNormalRow: false,
      width: "auto",
      hidden: false,
    },
    {
      field: "availableCount",
      header: dictionary.Available,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
  ];
  inventories: ProductItem[] = [];
  openAddItemModal = false;
  headerVariable: string | undefined;
  initPage$ = new Subscription();
  currencies: Currency[] = [];
  products: ProductSummary[] = [];
  selectedRow: ProductItem | undefined;
  searchProductLoading = false;
  getProducts$ = new Subscription();
  page = 1;
  pageSize = 12;
  inventorySearch: string | undefined;
  openAvailableItemsFilter: boolean = false;
  orderFilterRequest = new AvailableItemsFilterRequestDto();
  availableItemsFilter = new AvailableItemsFilterDto();
  productName: string | undefined;
  tagList: ITag[] = [];
  removeTag$ = new Subscription();
  changeTagList$ = new Subscription();
  sellAmount: number | undefined;
  getProductInvoice$ = new Subscription();
  branchId!: number;
  allProducts: ProductSummary[] = [];

  constructor(
    private coreService: CoreService,
    private currenciesClient: CurrenciesClient,
    private productsClient: ProductsClient,
    private loadingService: LoadingService,
    private layoutService: LayoutService,
    private titleService: Title,
    private tagService: TagService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });
    this.removeTag$ = tagService.removeTag$.subscribe((tagsKey: string) => {
      if (tagsKey == dictionary.Product) {
        this.availableItemsFilter.productId = undefined;
        this.productName = undefined;
      }
      if (tagsKey == dictionary.Currency) {
        this.availableItemsFilter.currencyId = undefined;
      }

      this.page = 1;
      this.updateRouteParameters(this.availableItemsFilter);
      this.initFilterRequest(
        this.page,
        this.pageSize,
        this.availableItemsFilter
      );
      this.initPage(this.orderFilterRequest);
    });
    this.layoutService.setTabName(
      `${dictionary.Stock} / ${dictionary.AvailableItems}`
    );
  }

  ngOnInit() {
    this.initFilterRequest(this.page, this.pageSize);
    const params = this.getUrlParams();
    if (params) {
      this.availableItemsFilter.productId = Number(params.productId);
      this.availableItemsFilter.currencyId = Number(params.currencyId);

      this.initFilterRequest(
        this.page,
        this.pageSize,
        this.availableItemsFilter
      );
    }
    this.initPage(this.orderFilterRequest);
    this.initTitle();
  }

  initPage(orderFilterRequest: AvailableItemsFilterRequestDto): void {
    this.loading = true;
    this.initPage$ = combineLatest({
      inventories: this.productsClient.getAvailableProductItems(
        orderFilterRequest.productId,
        orderFilterRequest.currencyId,
        orderFilterRequest.pageNumber,
        orderFilterRequest.pageSize
      ),
      currencies: this.currenciesClient.getCurrencies(),
      products: this.productsClient.getProducts("", null, null, 1, 10),
    }).subscribe({
      next: (res) => {
        this.initInventories(res.inventories);
        this.initProducts(res.products);
        this.initCurrencies(res.currencies);
        this.createTagFromUrlParams();
        this.loading = false;
      },
      error: (error: ResponseErrorDto) => {
        throw Error(error.message);
      },
    });
  }
  initProducts(products: ProductSummary[]) {
    this.products = products;
    this.allProducts = products;
  }
  initCurrencies(currencies: Currency[]): void {
    this.currencies = currencies;
  }
  initInventories(data: ProductItem[]): void {
    this.inventories = data;
  }
  initTitle() {
    this.titleService.setTitle(
      `${dictionary.AvailableItems} - ${dictionary.Stock} - ${this.layoutService.branchName}`
    );
  }
  initFilterRequest(
    page: number,
    pageSize: number,
    filter?: AvailableItemsFilterDto
  ): void {
    if (filter?.productId) {
      this.orderFilterRequest.productId = filter.productId;
    } else this.orderFilterRequest.productId = undefined;
    if (filter?.currencyId) {
      this.orderFilterRequest.currencyId = filter.currencyId;
    } else this.orderFilterRequest.currencyId = undefined;
    this.orderFilterRequest.pageNumber = page;
    this.orderFilterRequest.pageSize = pageSize;
  }

  onAdvancedFilterClick(): void {
    this.openAvailableItemsFilter = true;
  }

  updateRouteParameters(filter: AvailableItemsFilterDto) {
    const params: Params = {
      productId: filter.productId,
      currencyId: filter.currencyId,
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
    }, 100);
  }
  getUrlParams(): IAvailableItemsTags | undefined {
    if (!location.href.includes("?")) return;
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });
    const productId = httpParams.get("productId")!;
    const currencyId = httpParams.get("currencyId")!;

    let tags: IAvailableItemsTags;
    tags = {
      productId,
      currencyId,
    };

    return tags;
  }
  createTags(data: IAvailableItemsTags): void {
    let tags: ITag[];

    const productId: ITag = {
      key: dictionary.Product,
      value: data.productId
        ? this.products.find((x) => x.productId === Number(data.productId))
          ?.productName
        : undefined,
      clearable: true,
    };

    let product;

    if (data.productId) {
      product = this.products.find(
        (x) => x.productId === Number(data.productId)
      );
      if (!product) {
        this.productsClient
          .getProducts(data.productId, null, 1, 10)
          .subscribe((response) => {
            if (response.length > 0) {
              productId.value = response[0].productName;
              this.productName = response[0].productName;
            } else {
              productId.value = undefined;
            }
          });
      } else {
        productId.value = product.productName;
        this.productName = product.productName;
      }
    }

    const currencyId: ITag = {
      key: dictionary.Currency,
      value: this.getTagValueCurrency(Number(data.currencyId)),
      clearable: true,
    };

    tags = [productId, currencyId];
    this.tagService.createTags(tags);
  }

  getProducts(
    searchCriteria: string | null,
    pageNumber: any,
    pageSize: any
  ): void {
    this.searchProductLoading = true;
    this.getProducts$ = this.productsClient
      .getProducts(searchCriteria, null, null, pageNumber, pageSize)
      .subscribe({
        next: (res: ProductSummary[]) => {
          this.products = res;
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
        complete: () => {
          this.searchProductLoading = false;
        },
      });
  }

  saveProductItemOrderFilter(filter: AvailableItemsFilterDto) {
    this.openAvailableItemsFilter = false;
    this.availableItemsFilter.init(filter);
    this.page = 1;
    this.initFilterRequest(this.page, this.pageSize, filter);
    this.updateRouteParameters(filter);
    this.createTagFromUrlParams();
    this.getAvailableItems(this.orderFilterRequest);
  }
  getAvailableItems(orderFilterRequest: AvailableItemsFilterRequestDto) {
    this.loading = true;
    this.initPage$ = this.productsClient
      .getAvailableProductItems(
        orderFilterRequest.productId,
        orderFilterRequest.currencyId,
        orderFilterRequest.pageNumber,
        orderFilterRequest.pageSize
      )
      .subscribe({
        next: (res) => {
          this.initInventories(res);
          this.createTagFromUrlParams();
          this.loading = false;
        },
        error: (error: ResponseErrorDto) => {
          throw Error(error.message);
        },
      });
  }

  getTagValueCurrency(currencyId: number): string | undefined {
    let findCurrency = this.currencies.find(
      (currency) => currency.currencyId === currencyId
    );
    return findCurrency?.currencyName;
  }

  onExcelExportClick(): void {
    this.loadingService.present();
    this.productsClient.getAvailableProductItems(
      this.orderFilterRequest.productId,
      this.orderFilterRequest.currencyId,
      -1,
      undefined
    ).subscribe(
      {
        next: (res) => {
          let availableItems = res.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            currencyId: item.currency.currencyId,
            currencyName: item.currency.currencyName,
            faceValue: item.faceValue,
            availableCount: item.availableCount,
          }));
          this.coreService.exportExcel(availableItems, dictionary.Inventories);
          this.loadingService.dismiss();
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      }
    )
  }
  onRefreshClick(): void {
    this.initPage(this.orderFilterRequest);
  }
  downloadDuplicateCodesExcel(error: ResponseErrorDto) {
    const jsonError = JSON.parse(error.message!);
    const duplicateCodes = jsonError.DuplicateCodes.map((item: string) => ({
      code: item,
    }));

    this.coreService.exportExcel(duplicateCodes, dictionary.DuplicateCodes);
  }

  getProduct(id: number): ProductSummary | undefined {
    return this.products.find((p) => p.productId == id);
  }

  searchProduct(event: any) {
    this.products = [];
    if (!event) {
      this.getProducts(null, 1, 10);
    } else {
      this.getProducts(event, -1, null);
    }
  }

  pageChanged(data: IPageChange): void {
    this.page = data.page;
    this.orderFilterRequest.pageNumber = data.page;
    this.getAvailableItems(this.orderFilterRequest);
  }

  ngOnDestroy(): void {
    this.getInventories$.unsubscribe();
    this.getProducts$.unsubscribe();
    this.getProductInvoice$.unsubscribe();
  }
}
