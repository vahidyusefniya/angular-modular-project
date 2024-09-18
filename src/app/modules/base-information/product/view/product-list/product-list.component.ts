// noinspection JSIgnoredPromiseFromCall,ES6UnusedImports

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  IPageChange,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  CategoriesClient,
  Category,
  PatchOfString,
  PatchOfUri,
  PriceList,
  Product,
  ProductSummary,
  ProductsClient,
  SystemClient,
  UpdateProductRequest,
} from "@app/proxy/proxy";
import {
  ICol,
  ILinkRow,
} from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { ActionSheetController } from "@ionic/angular";
import { Subscription, combineLatest } from "rxjs";
import { ProductService } from "../../service/product.service";

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
      field: "productName",
      header: dictionary.Name,
      hasLinkRow: true,
      isRouteLink: false,
      linkRowPermission: "ProductRead",
      width: "auto",
      hidden: false,
    },
  ];
  openCreateProduct = false;
  openEditProductModal = false;
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
    private activatedRoute: ActivatedRoute
  ) {
    this.layoutService.setTabName(dictionary.Products);
    this.branchId = this.coreService.getBranchId()!;
    this.layoutService.checkPagePermission("ProductRead");
  }

  ngOnInit() {
    this.initPage();
  }

  initPage(): void {
    this.loading = true;
    this.initPage$ = combineLatest({
      categories: this.categoriesClient.getRootCategory(),
      products: this.productsClient.getProducts(
        this.searchCriteria,
        null,
        this.page,
        this.pageSize
      ),
    }).subscribe({
      next: (res) => {
        this.categories = res.categories;
        this.products = res.products;
      },
      error: (error: ResponseErrorDto) => {
        throw Error(error.message);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  getProducts(): void {
    this.loading = true;
    this.getProductsSub$ = this.productsClient
      .getProducts(this.searchCriteria, null, this.page, this.pageSize)
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
    this.page = 1;
    if (!value) {
      this.searchCriteria = undefined;
    } else {
      this.searchCriteria = value;
    }

    this.getProductsSub$ = this.productsClient
      .getProducts(this.searchCriteria, null, this.page, this.pageSize)
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

  newProduct(product: any): void {
    // const resData = new Product();
    // this.loadingService.present();
    // this.create$ = this.productsClient.create(product).subscribe({
    //   next: (res: Product) => {
    //     resData.init(res);
    //   },
    //   error: (error: ResponseErrorDto) => {
    //     this.loadingService.dismiss();
    //     throw Error(error.message);
    //   },
    //   complete: () => {
    //     this.loadingService.dismiss();
    //     this.notificationService.showSuccessNotification(
    //       `product "${resData.productName}" added successfully`
    //     );
    //     this.initPage();
    //   },
    // });
  }

  onEditProductClick(data: ILinkRow): void {
    this.loadingService.present();
    this.getProductSub$ = this.productsClient
      .get(data.data.productId)
      .subscribe({
        next: (res: Product) => {
          this.selectedProduct = res;
          this.openEditProductModal = true;
          // this.selectedRegionName = '';
          this.selectedCategoryName = this.productService.searchCategory(
            this.categories,
            data.data.categoryId
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
    imageUrl.value = data.imageUrl;
    description.value = data.description;
    product.imageUrl = imageUrl;
    product.description = description;

    return product;
  }

  onRefreshClick(): void {
    this.initPage();
  }
  onExcelExportClick(): void {
    this.loadingService.present()
    // this.loading = true;
    this.getProductsSub$ = this.productsClient
      .getProducts(this.searchCriteria, null, -1, undefined)
      .subscribe({
        next: (res) => {
          let products = res.map((item) => ({
            productId: item.productId,
            productName: item.productName,
          }));
          this.coreService.exportExcel(products, "products");
        },
        error: (error: ResponseErrorDto) => {
          // this.loading = false;
          this.loadingService.dismiss()
          throw Error(error.message);
        },
        complete: () => {
          this.loadingService.dismiss()
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
        id: 2,
        text: dictionary.NewProduct,
        handler: () => {
          this.openCreateProduct = true;
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
