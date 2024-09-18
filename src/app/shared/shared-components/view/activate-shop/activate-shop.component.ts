// noinspection JSIgnoredPromiseFromCall,DuplicatedCode,ES6MissingAwait

import {
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import { EGiftService } from "@app/modules/e-gift/service/e-gift.service";
import {
  Checkout,
  IPrevious,
  ProductShopDto,
  ShopCardType,
  ShopState,
} from "@app/modules/shop/dto/shop.dto";
import { ShopService } from "@app/modules/shop/service/shop.service";
import {
  BranchesClient,
  ExchangeCalc,
  PriceListsClient,
  Product,
  ProductsClient,
  Region,
  WalletsClient,
} from "@app/proxy/proxy";
import {
  CategoryProduct,
  ProductBuyPrice,
  BuyOrdersClient,
  ProductsClient as ShopProductsClient,
  PriceInvoice,
  PlaceDigitalCardOrderRequest,
} from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";
import { AlertController } from "@ionic/angular";
import { Subscription } from "rxjs";

@Component({
  selector: "app-activate-shop",
  templateUrl: "./activate-shop.component.html",
  styleUrls: ["./activate-shop.component.scss"],
})
export class ActivateShopComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  categories: CategoryProduct[] = [];
  openRegionModal = false;
  regionImage: string | undefined;
  regionName: string | undefined;
  selectedRegion: Region | undefined;
  getCategories$ = new Subscription();
  branchId: number;
  localImageSRC = "../../../../../assets/img/placeholder.jpg";
  shopState = new ShopState();
  openDescriptionModal = false;
  openBuyModal = false;
  selectedProduct!: ProductShopDto;
  openVerifyModal = false;
  faceValuePrice = 0;
  unitPrice = 0;
  totalPrice = 0;
  quantity = 0;
  deliveryType: string = "download";
  previousCategoryName: string | undefined;
  parentCategoryNames: string[] = [];
  changeBranch$ = new Subscription();
  searchValue: string | undefined;
  showInsufficientErrorAlert = false;
  textInsufficientErrorAlert: string | undefined = "";
  description: string | null | undefined = "";
  @Output() readyShop = new EventEmitter<boolean>(false);
  errorAlertButtons = [
    {
      text: dictionary.Cancel,
      role: "cancel",
      handler: () => {
        this.showInsufficientErrorAlert = false;
      },
    },
  ];
  showBuyPriceMismatchExceptionAlert = false;
  buyPriceMismatchExceptionButtons = [
    {
      text: dictionary.Cancel,
      role: "cancel",
      handler: () => {
        this.showBuyPriceMismatchExceptionAlert = false;
      },
    },
    {
      text: dictionary.Continue,
      handler: () => {
        this.showBuyPriceMismatchExceptionAlert = false;
        this.onBuyPriceMismatchExceptionContinueButtonAlertClick();
      },
    },
  ];

  textBuyPriceMismatchExceptionAlert: string | undefined;
  getProductInvoice$ = new Subscription();
  order = new PlaceDigitalCardOrderRequest();
  loading = false;
  rootCategory: CategoryProduct | undefined;
  width = 0;
  getProductSub$ = new Subscription();
  deliveryTypeValue: string | undefined;
  merchantId: number;

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.width = event.target.innerWidth;
  }

  constructor(
    private shopService: ShopService,
    public coreService: CoreService,
    private eGiftService: EGiftService,
    private loadingService: LoadingService,
    private ordersClient: BuyOrdersClient,
    private notificationService: NotificationService,
    private layoutService: LayoutService,
    private priceListsClient: PriceListsClient,
    private branchesClient: BranchesClient,
    private alertController: AlertController,
    private productsClient: ProductsClient,
    private ShopProductsClient: ShopProductsClient,
    private router: Router,
    private walletsClient: WalletsClient
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.merchantId = coreService.getMerchantId(
      this.coreService.getBranchId()!
    )!;
    this.changeBranch$ = this.layoutService.changeBranch.subscribe((branch) => {
      this.branchId = branch.branchId;
      this.merchantId = coreService.getMerchantId(
        this.coreService.getBranchId()!
      )!;
      this.initCategoryProduct();
    });

    this.layoutService.setTabName(dictionary.Shop);
    this.layoutService.checkPagePermission("RootCategory");
  }

  ngOnInit() {
    this.width = window.innerWidth;
    if (!this.checkShowShopItemMenu()) {
      this.router.navigate([`/branches/${this.branchId}/price-lists`]);
    }
    this.initCategoryProduct();
    this.initRegion();
  }
  initRegion(): void {
    if (!this.regionImage) {
      this.regionImage = this.eGiftService.getRegions()[0].image!;
      this.regionName = this.eGiftService.getRegions()[0].name;
    }
  }
  initCategoryProduct(): void {
    const me = this;
    this.loading = true;
    this.getCategories$ = this.ShopProductsClient.getProducts(
      this.branchId
    ).subscribe({
      next: (res: CategoryProduct) => {
        if (res) {
          this.rootCategory = res;
          this.categories = res.categories!;
          this.initShopState(undefined, this.categories, "category");
        } else this.initShopState(undefined, this.categories, "category");
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        this.readyShop.emit(true);
        throw Error(error.message);
      },
      complete() {
        me.readyShop.emit(true);
        me.loading = false;
      },
    });
  }
  checkShowShopItemMenu(): boolean {
    return this.layoutService.branch?.canPlaceOrder!;
  }

  chooseRegion(region: Region): void {
    this.openRegionModal = false;
    this.regionImage = region.imageUrl!;
    this.selectedRegion = region;
  }

  onInputSearch(value: string): void {
    this.searchValue = value;
    if (value.length == 0) {
      this.shopState.previous = [];
      this.initShopState(undefined, this.categories, "category");
    } else {
      this.shopState.previous = [];
      this.eGiftService.resultFilterProducts = [];
      let products = this.eGiftService.filterProduct(this.rootCategory!, value);
      products = [
        ...new Map(
          products.map((item) => [item["productName"], item])
        ).values(),
      ];
      const shopProducts: ProductShopDto[] = [];
      products.forEach((product) => {
        if (product.faceValues) {
          product.faceValues.forEach((faceValue) => {
            shopProducts.push({
              currency: product.currency,
              faceValue: faceValue,
              imageUrl: product.imageUrl!,
              productId: product.productId,
              productName: product.productName,
              hasDescription: product.hasDescription,
            });
          });
        }
      });
      this.initShopState(
        {
          data: this.rootCategory?.categories!,
          shopCardType: "category",
        },
        shopProducts,
        "product"
      );
    }
  }

  initShopState(
    previous: IPrevious | undefined,
    current: ProductShopDto[] | CategoryProduct[],
    type: ShopCardType
  ): void {
    this.shopState.shopCardType = type;
    if (current.length > 100) {
      this.shopState.current = current.slice(0, 50);
      setTimeout(() => {
        this.shopState.current = current;
      }, 200);
    } else this.shopState.current = current;
    if (previous) this.shopState.previous.push(previous);
  }
  onShopCardClick(state: ShopState, data: any, type: ShopCardType): void {
    let previousData: IPrevious = {
      data: state.current,
      shopCardType: type,
    };
    if (type === "category") {
      this.initParentCategoryNames(data.parentCategoryId);
      this.previousCategoryName = data.categoryName;
      if (data.categories && data.categories.length > 0) {
        this.initShopState(previousData, data.categories, "category");
      } else if (data.categories && data.categories.length == 0) {
        const products: ProductShopDto[] = [];
        data.productBuyPrices.forEach((productBuyPrice: ProductBuyPrice) => {
          if (productBuyPrice.faceValues) {
            productBuyPrice.faceValues.forEach((faceValue) => {
              products.push({
                currency: productBuyPrice.currency,
                faceValue: faceValue,
                imageUrl: productBuyPrice.imageUrl!,
                productId: productBuyPrice.productId,
                productName: productBuyPrice.productName,
                hasDescription: productBuyPrice.hasDescription!,
              });
            });
          }
        });
        this.initShopState(previousData, products, "product");
      }
    }
  }
  onBackButtonClick(): void {
    this.eGiftService.clearSearchBarValue("searchbar");
    let current = this.shopState.previous.pop();
    this.previousCategoryName = this.parentCategoryNames.pop();
    if (current) {
      this.initShopState(
        this.shopState.previous.pop()!,
        current.data,
        current.shopCardType
      );
    }
  }

  onOpenDescriptionModalClick(data: Product): void {
    this.loadingService.present();
    this.getProductSub$ = this.productsClient.get(data.productId).subscribe({
      next: (res: Product) => {
        this.description = res.description;
        this.openDescriptionModal = true;
        this.loadingService.dismiss();
      },
      error: (error: ResponseErrorDto) => {
        this.loadingService.dismiss();
        throw Error(error.message);
      },
    });
  }
  onOpenBuyModalClick(data: ProductShopDto): void {
    this.selectedProduct = data;
    this.openBuyModal = true;
  }
  onOpenVerifyModal(data: Checkout): void {
    this.selectedProduct = data.product!;
    this.faceValuePrice = data.faceValuePrice!;
    this.unitPrice = data.unitPrice!;
    this.totalPrice = data.totalPrice!;
    this.quantity = data.quantity!;
    this.deliveryType = data.type!;
    this.deliveryTypeValue = data.deliveryTypeValue!;
    this.openVerifyModal = true;
  }
  onVerifyClick(data: PlaceDigitalCardOrderRequest): void {
    this.order.init(data);
    this.openVerifyModal = false;
    this.loadingService.present();
    data.withExchange = false;
    this.ordersClient.placeOrder(this.branchId!, data).subscribe({
      next: (res: number) => {
        this.loadingService.dismiss();
        this.notificationService.showSuccessNotification(
          `Order "${res}" created successfully`
        );
      },
      error: async (error: ResponseErrorDto) => {
        this.loadingService.dismiss();
        if (error.typeName === dictionary.InsufficientBalanceException) {
          this.showInsufficientErrorAlert = true;
          this.textInsufficientErrorAlert =
            dictionary.InsufficientBalanceException;
        } else if (error.typeName === dictionary.BuyPriceMismatchException) {
          this.showBuyPriceMismatchExceptionAlert = true;
          this.textBuyPriceMismatchExceptionAlert = `Please note that the unit price for your order has changed.`;
        } else if (
          error.typeName === dictionary.WalletInsufficientBalanceException
        ) {
          this.loadingService.present();
          this.ordersClient
            .getExchangeCalc(
              this.branchId!,
              this.merchantId,
              this.selectedProduct.currency.currencyId,
              this.totalPrice
            )
            .subscribe({
              next: async (response: ExchangeCalc) => {
                this.loadingService.dismiss();
                const walletInsufficientBalanceExceptionAlert =
                  await this.alertController.create({
                    header: dictionary.InsufficientBalance,
                    message: `
                Please charge your account to continue shopping.<br /><br />
                Do you want to exchange from other currencies?<br /><br />
                <b>Exchange from</b> ${response.baseCurrency.currencyName} To ${response.targetCurrency.currencyName}.<br />
                <b>Exchange Rate</b>: ${response.exchangeRate}<br />
                <b>Total amount</b>: ${response.targetAmount} <span class="currency">(${response.targetCurrency.currencyName})</span><br />
                `,
                    animated: false,
                    cssClass: "deletePrice__alert",
                    buttons: [
                      {
                        text: dictionary.Cancel,
                        role: "cancel",
                        cssClass: "info-alert-btn",
                      },
                      {
                        text: dictionary.Confirm,
                        role: "confirm",
                        cssClass: "primary-alert-btn",
                        handler: () => {
                          this.loadingService.present();
                          data.withExchange = true;
                          this.ordersClient
                            .placeOrder(this.branchId!, data)
                            .subscribe({
                              next: (res: number) => {
                                this.loadingService.dismiss();
                                this.notificationService.showSuccessNotification(
                                  `Order "${res}" created successfully`
                                );
                              },
                              error: async (error: ResponseErrorDto) => {
                                this.loadingService.dismiss();
                                this.notificationService.showErrorAlertNotification(
                                  error.message!
                                );
                              },
                            });
                        },
                      },
                    ],
                  });
                await walletInsufficientBalanceExceptionAlert.present();
              },
              error: async (error: ResponseErrorDto) => {
                this.loadingService.dismiss();
                this.notificationService.showErrorAlertNotification(
                  error.message!
                );
              },
            });
        } else {
          this.notificationService.showErrorAlertNotification(error.message!);
        }
      },
    });
  }
  onBuyPriceMismatchExceptionContinueButtonAlertClick(): void {
    this.loadingService.present();
    this.getProductInvoice$ = this.ShopProductsClient.getProductInvoice(
      this.branchId,
      this.selectedProduct.productId!,
      this.order.productPrice
    ).subscribe({
      next: (res: PriceInvoice) => {
        this.loadingService.dismiss();
        this.unitPrice = res.sellAmount;
        this.openVerifyModal = true;
      },
      error: (error: ResponseErrorDto) => {
        this.loadingService.dismiss();
        throw Error(error.message);
      },
    });
  }

  initParentCategoryNames(parentCategoryId: number): void {
    const parentCategoryName = this.shopService.searchCategory(
      this.rootCategory!,
      parentCategoryId
    )?.categoryName;

    if (parentCategoryName) this.parentCategoryNames.push(parentCategoryName);
  }

  ngOnDestroy(): void {
    this.getCategories$.unsubscribe();
    this.changeBranch$.unsubscribe();
    this.getProductInvoice$.unsubscribe();
    this.getProductSub$.unsubscribe();
  }
}
