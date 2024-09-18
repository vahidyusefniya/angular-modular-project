// noinspection JSIgnoredPromiseFromCall,ES6UnusedImports

import { Component, OnDestroy, OnInit } from "@angular/core";
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
  PatchOfInt32Of,
  PatchOfInteger,
  PatchOfString,
  PatchOfUri,
  PriceList,
  Product,
  ProductSummary,
  ProductsClient,
  Region,
  SystemClient,
  UpdateProductRequest,
} from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { ActionSheetController } from "@ionic/angular";
import { Subscription, combineLatest } from "rxjs";
import { IProductsTagFilter, ProductFilterDto } from "../../dto/product.dto";
import { ProductService } from "../../service/product.service";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { HttpParams } from "@angular/common/http";

@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.scss"],
})
export class ProductListComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  products: ProductSummary[] = [];
  loading = false;
  cols: ICol[] = [
    {
      field: "productId",
      header: dictionary.Id,
      hasLinkRow: true,
      isRouteLink: false,
      linkRowPermission: "ProductRead",
      width: "auto",
      hidden: false,
    },
    {
      field: "productName",
      header: dictionary.Name,
      hasLinkRow: false,
      isRouteLink: false,
      linkRowPermission: "ProductRead",
      width: "auto",
      hidden: false,
    },
    {
      field: "providerSku",
      header: dictionary.ProviderSKU,
      hasLinkRow: false,
      isRouteLink: false,
      linkRowPermission: "ProductRead",
      width: "auto",
      hidden: false,
    },
  ];
  openCreateProduct = false;
  openEditProductModal = false;
  openFilterModal = false;
  selectedProduct: Product | undefined;
  categories!: Category;
  initPage$ = new Subscription();
  create$ = new Subscription();
  selectedCategoryName: string | undefined;
  selectedRegionName: string | undefined;
  page = 1;
  pageSize = 12;
  searchCriteria: string | undefined;
  getProductsSub$ = new Subscription();
  hasLocalPagination = false;
  systemRootPriceList = new PriceList();
  branchId: number;
  setByPriceModal = false;
  getSystemRootPriceList$ = new Subscription();
  getProductSub$ = new Subscription();
  filterProduct = new ProductFilterDto();
  tagList: ITag[] = [];
  removeTag$ = new Subscription();
  changeTagList$ = new Subscription();
  currencies: Currency[] = [];

  constructor(
    private productsClient: ProductsClient,
    private productService: ProductService,
    private categoriesClient: CategoriesClient,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private coreService: CoreService,
    private layoutService: LayoutService,
    private actionSheetCtrl: ActionSheetController,
    private systemClient: SystemClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tagService: TagService,
    private currenciesClient: CurrenciesClient
  ) {
    this.layoutService.setTabName(
      `${dictionary.Products} - ${dictionary.System}`
    );
    this.branchId = this.coreService.getBranchId()!;
    this.layoutService.checkPagePermission("ProductRead");
    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });

    this.removeTag$ = tagService.removeTag$.subscribe((tagsKey: string) => {
      if (tagsKey == dictionary.Currency) {
        this.filterProduct.currencyId = undefined;
      }
      if (tagsKey == dictionary.Category) {
        this.filterProduct.categoryId = undefined;
      }

      this.updateRouteParameters(this.filterProduct);
      this.getProducts();
    });
  }

  ngOnInit() {
    const params = this.getUrlParams();
    if (params) {
      this.filterProduct.init({
        currencyId: params.currencyId ? Number(params.currencyId) : undefined,
        categoryId: params.categoryId ? Number(params.categoryId) : undefined,
      });
    }
    this.initPage();
    this.getCurrenicies();
  }

  initPage(): void {
    this.loading = true;
    this.initPage$ = combineLatest({
      categories: this.categoriesClient.getRootCategory(),
      products: this.productsClient.getProducts(
        this.searchCriteria,
        this.filterProduct.currencyId,
        this.filterProduct.categoryId,
        this.page,
        this.pageSize
      )
    }).subscribe({
      next: (res) => {
        this.categories = res.categories;
        this.products = res.products;
        // this.currencies = res.currenicies;
        this.createTags({ categoryId: String(this.filterProduct.categoryId), currencyId: String(this.filterProduct.currencyId) })
      },
      error: (error: ResponseErrorDto) => {
        throw Error(error.message);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  getCurrenicies() {
    this.currenciesClient.getCurrencies().subscribe({
      next: (res) => {
        this.currencies = res;
      }, error: (error) => {
        throw Error(error.message);
      }
    })
  }

  getProducts(): void {
    this.loading = true;
    this.getProductsSub$ = this.productsClient
      .getProducts(
        this.searchCriteria,
        this.filterProduct.currencyId,
        this.filterProduct.categoryId,
        this.page,
        this.pageSize
      )
      .subscribe({
        next: (res) => {
          this.products = res;
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  onInputSearch(value: any): void {
    this.loading = true;
    this.page = 1;
    if (!value) {
      this.searchCriteria = undefined;
    } else {
      this.searchCriteria = value;
    }

    this.getProductsSub$ = this.productsClient
      .getProducts(
        this.searchCriteria,
        this.filterProduct.currencyId,
        this.filterProduct.categoryId,
        this.page,
        this.pageSize
      )
      .subscribe({
        next: (res) => {
          this.products = res;
          this.page = 1;
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  saveProductFilter(filter: ProductFilterDto) {
    this.page = 1;
    this.openFilterModal = false;
    this.filterProduct.init(filter);
    this.updateRouteParameters(filter);
    this.initPage();
  }

  updateRouteParameters(filter: ProductFilterDto) {
    const params: Params = {
      currencyId: filter.currencyId,
      categoryId: filter.categoryId,
    };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: "merge",
    });
  }
  createTagFromUrlParams(): void {
    const params = this.getUrlParams()!;
    if (params) this.createTags(params);
  }
  getUrlParams(): IProductsTagFilter | undefined {
    if (!location.href.includes("?")) return;
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });

    const currencyId = httpParams.get("currencyId")!;
    const categoryId = httpParams.get("categoryId")!;

    let tags: IProductsTagFilter;
    tags = {
      currencyId,
      categoryId,
    };

    return tags;
  }
  createTags(data: IProductsTagFilter): void {
    let tags: ITag[];
    const categoryTag: ITag = {
      key: dictionary.Category,
      value: this.getCategoryTag(Number(data.categoryId)),
      clearable: true,
    };

    const currencyTag = {
      key: dictionary.Currency,
      value: this.getCurrencyTag(Number(data.currencyId)),
      clearable: true,
    };

    tags = [currencyTag, categoryTag];
    this.tagService.createTags(tags);
  }

  getCurrencyTag(id: number) {
    let findCurrency = this.currencies.find((item) => item.currencyId === id);
    return findCurrency?.currencyName;
  }

  getCategoryTag(id: number) {
    return this.productService.searchCategory(this.categories, id)
      ?.categoryName;
  }

  newProduct(product: any): void {
    const resData = new Product();
    this.loadingService.present();
    this.create$ = this.productsClient.create(product).subscribe({
      next: (res: Product) => {
        resData.init(res);
      },
      error: (error: ResponseErrorDto) => {
        this.loadingService.dismiss();
        throw Error(error.message);
      },
      complete: () => {
        this.loadingService.dismiss();
        this.notificationService.showSuccessNotification(
          `product "${resData.productName}" added successfully`
        );
        this.initPage();
      },
    });
  }

  onEditProductClick(event: Event, data: ProductSummary): void {
    event.preventDefault();
    this.loadingService.present();
    this.getProductSub$ = this.productsClient.get(data.productId).subscribe({
      next: (res: Product) => {
        this.selectedProduct = res;
        this.openEditProductModal = true;
        this.selectedRegionName = this.getRegionName(res.regions!);
        this.selectedCategoryName = this.productService.searchCategory(
          this.categories,
          data.category.categoryId
        )?.categoryName;
        this.loadingService.dismiss();
      },
      error: (error: ResponseErrorDto) => {
        this.loadingService.dismiss();
        throw Error(error.message);
      },
    });
  }
  editProduct(data: Product): void {
    const product = this.convertEditData(data);
    this.openEditProductModal = false;
    this.loadingService.present();
    this.create$ = this.productsClient
      .update(this.selectedProduct?.productId!, product)
      .subscribe({
        next: (res: Product) => {
          this.notificationService.showSuccessNotification(
            `product "${res.productName}" updated successfully`
          );
          this.loadingService.dismiss();
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
        complete: () => {
          this.initPage();
        },
      });
  }
  convertEditData(data: Product): UpdateProductRequest {
    const product = new UpdateProductRequest();
    const imageUrl = new PatchOfUri();
    const description = new PatchOfString();
    const productName = new PatchOfString();
    const categoryId = new PatchOfInteger();
    const regionIds = new PatchOfInt32Of();
    regionIds.value =
      data.regions?.length! > 0 ? [data.regions![0]!.regionId] : [];
    imageUrl.value = data.imageUrl;
    description.value = data.description;
    productName.value = data.productName;
    categoryId.value = data.categoryId;
    product.imageUrl = imageUrl;
    product.description = description;
    product.productName = productName;
    product.categoryId = categoryId;
    product.regionIds = regionIds;

    return product;
  }

  getRegionName(regions: Region[]) {
    if (regions.length > 0) {
      return regions[0].name;
    } else {
      return "";
    }
  }
  onRefreshClick(): void {
    this.initPage();
  }
  onExcelExportClick(): void {
    // this.loading = true;
    this.loadingService.present();
    this.getProductsSub$ = this.productsClient
      .getProducts(
        this.searchCriteria,
        this.filterProduct.currencyId,
        this.filterProduct.categoryId,
        -1,
        undefined
      )
      .subscribe({
        next: (res) => {
          let products = res.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            isPhysical: item.isPhysical,
            providerSku: item.providerSku,
            upc: item.upc,
            currencyId: item.currency.currencyId,
            currencyName: item.currency.currencyName,
            categoryId: item.category.categoryId,
            categoryName: item.category.categoryName,
            imageUrl: item.imageUrl,
          }));
          this.coreService.exportExcel(products, "products");
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          // this.loading = false;
          throw Error(error.message);
        },
        complete: () => {
          this.loadingService.dismiss();
          // this.loading = false;
        },
      });
  }
  pageChanged(data: IPageChange): void {
    this.page = data.page;
    this.pageSize = data.pageSize;
    this.getProducts();
  }

  onOpenSetByPriceModalClick(): void {
    this.loadingService.present();
    this.getSystemRootPriceList$ = this.systemClient
      .getSystemRootPriceList()
      .subscribe({
        next: (res) => {
          this.systemRootPriceList.init(res);
          this.setByPriceModal = true;
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

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: this.initActionSheetItems(),
    });

    await actionSheet.present();
  }
  initActionSheetItems(): any[] {
    const permissions: string[] = this.layoutService.getPermissions();
    const isNewProductPermission = permissions.find(
      (p) => p === "ProductWrite"
    );
    const isSetBuyingPricePermission = permissions.find(
      (p) => p === "SetBuyPrice"
    );

    const items = [
      {
        id: 1,
        text: dictionary.SetBuyingPrice,
        handler: () => {
          this.onOpenSetByPriceModalClick();
        },
        permission: "ProductWrite",
      },
      {
        id: 1,
        text: dictionary.NewProduct,
        handler: () => {
          this.openCreateProduct = true;
        },
        permission: "ProductWrite",
      },
      {
        id: 1,
        text: dictionary.AdvanceFilter,
        handler: () => {
          this.openFilterModal = true;
        },
        permission: "ProductWrite",
      },
      {
        text: dictionary.Cancel,
        role: "cancel",
        data: {
          action: "cancel",
        },
      },
    ];

    if (!isNewProductPermission) {
      const newButtonIndex = items.findIndex((i) => i.id === 2);
      if (newButtonIndex > -1) items.splice(newButtonIndex, 1);
    }
    if (!isSetBuyingPricePermission) {
      const newButtonIndex = items.findIndex((i) => i.id === 1);
      if (newButtonIndex > -1) items.splice(newButtonIndex, 1);
    }

    return items;
  }

  ngOnDestroy(): void {
    this.initPage$.unsubscribe();
    this.create$.unsubscribe();
    this.getProductsSub$.unsubscribe();
    this.getProductSub$.unsubscribe();
  }
}
