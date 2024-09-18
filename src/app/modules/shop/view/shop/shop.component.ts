// noinspection JSIgnoredPromiseFromCall,DuplicatedCode,ES6MissingAwait

import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  ExchangeService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import { EGiftService } from "@app/modules/e-gift/service/e-gift.service";
import { ExchangeProduct } from "@app/modules/physical-gift-cards/dto/product.dto";
import {
  Branch,
  Currency,
  ExchangeCalc,
  Product,
  ProductsClient,
  Region,
} from "@app/proxy/proxy";
import {
  BuyOrdersClient,
  CategoryProduct,
  CurrenciesClient,
  CurrencyExchangeRate,
  PlaceDigitalCardOrderRequest,
  PriceInvoice,
  ProductBuyPrice,
  ProductsClient as ShopPorductClient,
} from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";
import { AlertButton, AlertController } from "@ionic/angular";
import { Subscription } from "rxjs";
import {
  Checkout,
  IPrevious,
  ProductShopDto,
  ShopCardType,
  ShopState,
} from "../../dto/shop.dto";
import { ShopService } from "../../service/shop.service";

const MIN_SEARCH_KEYWORD_LENGTH: number = 3;
@Component({
  selector: "app-shop",
  templateUrl: "./shop.component.html",
  styleUrls: ["./shop.component.scss"],
})
export class ShopComponent implements OnInit, OnDestroy {
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
  getCurrencies$ = new Subscription();
  currencies: Currency[] = [];
  successMessage: string = "";
  showSuccessMessage: boolean = false;

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
  selectedBranch = new Branch();
  textBuyPriceMismatchExceptionAlert: string | undefined;
  getProductInvoice$ = new Subscription();
  order = new PlaceDigitalCardOrderRequest();
  loading = false;
  rootCategory: CategoryProduct | undefined;
  width = 0;
  getProductSub$ = new Subscription();
  deliveryTypeValue: string | undefined;
  merchantId: number;
  email: string | undefined;
  isOpenSuccessOrderAlert = false;
  successOrderMessage: string | undefined;
  successOrderAlertButtons: AlertButton[] = [];
  exchangeSubject$ = new Subscription();
  openSetPinModal = false;

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.width = event.target.innerWidth;
  }

  constructor(
    private shopService: ShopService,
    public coreService: CoreService,
    private eGiftService: EGiftService,
    private ordersClient: BuyOrdersClient,
    private notificationService: NotificationService,
    private layoutService: LayoutService,
    private alertController: AlertController,
    private productsClient: ProductsClient,
    private shopProductClient: ShopPorductClient,
    private router: Router,
    private currenciesClient: CurrenciesClient,
    private exchangeService: ExchangeService
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

    this.exchangeSubject$ = this.exchangeService.exchangeSubject.subscribe(
      () => {
        this.loading = true;
        this.order.withExchange = true;
        this.ordersClient
          .placeOrder(this.branchId!, this.shopService.order)
          .subscribe({
            next: async (res: number) => {
              this.loading = false;
              this.successOrderMessage = `Order <b class="order-text-color">${res}</b> has been submitted successfully.`;
              this.successOrderAlertButtons = [
                {
                  text: dictionary.ViewOrders,
                  role: "confirm",
                  cssClass: "info-alert-btn",
                  handler: () => {
                    this.router.navigate([
                      `/branches/${this.branchId}/reports/buys`,
                    ]);
                  },
                },
                {
                  text: dictionary.ContinueShopping,
                  role: "cancel",
                  cssClass: "primary-alert-btn",
                  handler: () => {
                    this.isOpenSuccessOrderAlert = false;
                  },
                },
              ];
              this.isOpenSuccessOrderAlert = true;
            },
            error: async (error: ResponseErrorDto) => {
              this.loading = false;
              if (error.typeName === dictionary.NeedToActive2FaException) {
                this.notificationService.showErrorAlertNotification(
                  "Your 2FA verification is not enabled.",
                  "2FA is inactive."
                );
              } else if (error.typeName === dictionary.NeedToPinException) {
                this.openSetPinModal = true;
              } else if (error.typeName === dictionary.InvalidPinException) {
                this.notificationService.showErrorAlertNotification(
                  "wrong pin"
                );
              } else {
                this.notificationService.showErrorAlertNotification(
                  error.message ? error.message : "Internal server error"
                );
              }
            },
          });
      }
    );

    this.layoutService.setTabName(dictionary.Shop);
    this.layoutService.checkPagePermission("RootCategory");
  }

  ngOnInit() {
    this.width = window.innerWidth;
    if (!this.checkShowShopItemMenu()) {
      this.router.navigate([`/branches/${this.branchId}/price-lists`]);
    }
    this.getCurrencies();
    this.initCategoryProduct();
    this.initRegion();
  }

  isValidSearchInput(keyword: any) {
    return keyword.trim().length >= MIN_SEARCH_KEYWORD_LENGTH;
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
    this.getCategories$ = this.shopProductClient
      .getProducts(this.branchId, true, this.selectedRegion?.regionId)
      .subscribe({
        next: (res: CategoryProduct) => {
          if (res) {
            this.rootCategory = res;
            this.categories = res.categories!;
            this.initShopState(undefined, this.categories, "category");
          } else this.initShopState(undefined, this.categories, "category");
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
  checkShowShopItemMenu(): boolean {
    return this.layoutService.branch?.canPlaceOrder!;
  }

  chooseRegion(region: Region): void {
    this.openRegionModal = false;
    this.regionImage = region.imageUrl!;
    this.selectedRegion = region;
    this.initCategoryProduct();
  }

  onInputSearch(value: string): void {
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
      const shopProducts = this.fillProducts(products);
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

  resetShopState(): void {
    this.shopState.previous = [];
    this.initShopState(undefined, this.categories, "category");
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
        const products: ProductShopDto[] = this.fillProducts(
          data.productBuyPrices
        );
        this.initShopState(previousData, products, "product");
      }
    }
  }
  fillProducts(data: ProductBuyPrice[]): ProductShopDto[] {
    const products: ProductShopDto[] = [];
    for (let index = 0; index < data.length; index++) {
      const productBuyPrice = data[index];
      if (productBuyPrice.faceValues) {
        productBuyPrice.faceValues.forEach((faceValue) => {
          if (products.length == 0) {
            products.push({
              currency: productBuyPrice.currency,
              faceValue: faceValue,
              imageUrl: productBuyPrice.imageUrl!,
              productId: productBuyPrice.productId,
              productName: productBuyPrice.productName,
              hasDescription: productBuyPrice.hasDescription!,
            });
          } else {
            const equalFaceValueIndex = products.findIndex(
              (t) => t.faceValue.faceValue == faceValue.faceValue
            );
            if (equalFaceValueIndex != -1 && faceValue.end !== null) {
              products[equalFaceValueIndex] = {
                currency: productBuyPrice.currency,
                faceValue: {
                  faceValue: faceValue.faceValue,
                  endValue: faceValue.endValue,
                  end:
                    products[equalFaceValueIndex].faceValue.end! >
                    faceValue.end!
                      ? products[equalFaceValueIndex].faceValue.end!
                      : faceValue.end!,
                  start:
                    products[equalFaceValueIndex].faceValue.start! <
                    faceValue.start!
                      ? products[equalFaceValueIndex].faceValue.start!
                      : faceValue.start!,
                  init(_data: any) {},
                  toJSON(data: any) {},
                  isEndless: faceValue.isEndless,
                  consumerFee: faceValue.consumerFee,
                  consumerTax: faceValue.consumerTax,
                },
                imageUrl: productBuyPrice.imageUrl!,
                productId: productBuyPrice.productId,
                productName: productBuyPrice.productName,
                hasDescription: productBuyPrice.hasDescription!,
              };
            } else {
              products.push({
                currency: productBuyPrice.currency,
                faceValue: faceValue,
                imageUrl: productBuyPrice.imageUrl!,
                productId: productBuyPrice.productId,
                productName: productBuyPrice.productName,
                hasDescription: productBuyPrice.hasDescription!,
              });
            }
          }
        });
      }
    }
    return products;
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
    this.loading = true;
    this.getProductSub$ = this.productsClient.get(data.productId).subscribe({
      next: (res: Product) => {
        this.description = res.description;
        this.openDescriptionModal = true;
        this.loading = false;
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;

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
    this.email = data.email;
    this.openVerifyModal = true;
  }
  onVerifyClick(data: PlaceDigitalCardOrderRequest): void {
    this.order = data;
    this.shopService.setOrder(data);
    this.openVerifyModal = false;
    this.loading = true;
    data.withExchange = false;
    this.ordersClient.placeOrder(this.branchId!, data).subscribe({
      next: async (res: number) => {
        this.loading = false;
        this.successOrderMessage = `Order <b class="order-text-color">${res}</b> has been submitted successfully.`;
        this.successOrderAlertButtons = [
          {
            text: dictionary.ViewOrders,
            role: "confirm",
            cssClass: "info-alert-btn",
            handler: () => {
              this.router.navigate([`/branches/${this.branchId}/reports/buys`]);
            },
          },
          {
            text: dictionary.ContinueShopping,
            role: "cancel",
            cssClass: "primary-alert-btn",
            handler: () => {
              this.isOpenSuccessOrderAlert = false;
            },
          },
        ];
        this.isOpenSuccessOrderAlert = true;
      },
      error: async (error: ResponseErrorDto) => {
        this.loading = false;
        if (error.typeName === dictionary.InsufficientBalanceException) {
          this.exchangeService.onInsufficientBalanceException(error);
        } else if (error.typeName === dictionary.BuyPriceMismatchException) {
          this.showBuyPriceMismatchExceptionAlert = true;
          this.textBuyPriceMismatchExceptionAlert = `Please note that the unit price for your order has changed.`;
        } else if (
          error.typeName === dictionary.WalletInsufficientBalanceException
        ) {
          const product: ExchangeProduct = {
            ...this.selectedProduct,
            unitFaceValuePrice: this.faceValuePrice,
            currency: new Currency({
              currencyId: this.selectedProduct?.currency?.currencyId,
              currencyName: this.selectedProduct?.currency?.currencyName,
            }),
            unitBuyPrice: this.unitPrice,
            totalPrice: this.totalPrice,
          };
          this.exchangeService.onWalletInsufficientBalanceException(
            product,
            error
          );
        } else if (
          error.typeName === dictionary.StockInsufficientBalanceException
        ) {
          this.exchangeService.onStockInsufficientBalanceException();
        } else if (error.typeName === dictionary.NeedToActive2FaException) {
          this.notificationService.showErrorAlertNotification(
            "Your 2FA verification is not enabled.",
            "2FA is inactive."
          );
        } else if (error.typeName === dictionary.InvalidPinException) {
          this.notificationService.showErrorAlertNotification("wrong pin");
        } else if (error.typeName === dictionary.NeedToPinException) {
          this.openSetPinModal = true;
        } else {
          this.notificationService.showErrorAlertNotification(
            error.message ? error.message : "Internal server error"
          );
        }
      },
    });
  }

  onSetPin(pin: string): void {
    this.openSetPinModal = false;
    this.order.pin = pin;
    this.onVerifyClick(this.order);
  }

  getExchangeCalc(data: PlaceDigitalCardOrderRequest) {
    this.loading = true;
    this.ordersClient
      .getExchangeCalc(
        this.branchId!,
        this.merchantId,
        this.selectedProduct.currency.currencyId,
        this.totalPrice
      )
      .subscribe({
        next: async (response: ExchangeCalc) => {
          this.loading = false;
          const walletInsufficientBalanceExceptionAlert =
            await this.alertController.create({
              header: dictionary.InsufficientBalance,
              message: `
          Please charge your account to continue shopping.<br /><br />
          Do you want to exchange from other currencies?<br /><br />
          <span class="gray-color">Exchange from</span> <b >${response.baseCurrency.currencyName}</b> <span class="gray-color">To</span> <b >${response.targetCurrency.currencyName}.</b><br />
          <span class="gray-color">Exchange Rate:</span> <b>${response.exchangeRate}</b><br />
          <span class="gray-color">Total amount:</span> <b>${response.targetAmount}</b> <b >(${response.targetCurrency.currencyName})</b><br />
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
                    this.loading = true;
                    data.withExchange = true;
                    this.ordersClient
                      .placeOrder(this.branchId!, data)
                      .subscribe({
                        next: async (res: number) => {
                          this.loading = false;
                          const alert = await this.alertController.create({
                            header: dictionary.SuccessOrder!,
                            message: `Order <b class="order-text-color">${res}</b> has been submitted successfully.`,
                            animated: false,
                            cssClass: "success-buy-alert",
                            buttons: [
                              {
                                text: dictionary.ViewOrders,
                                role: "confirm",
                                cssClass: "info-alert-btn",
                                handler: () => {
                                  this.router.navigate([
                                    `/branches/${this.branchId}/reports/buys`,
                                  ]);
                                },
                              },
                              {
                                text: dictionary.ContinueShopping,
                                role: "cancel",
                                cssClass: "primary-alert-btn",
                              },
                            ],
                          });
                          await alert.present();
                        },
                        error: async (error: ResponseErrorDto) => {
                          this.loading = false;
                          if (
                            error.typeName ===
                            dictionary.NeedToActive2FaException
                          ) {
                            this.notificationService.showErrorAlertNotification(
                              "Your 2FA verification is not enabled.",
                              "2FA is inactive."
                            );
                          } else {
                            this.notificationService.showErrorAlertNotification(
                              error.message
                                ? error.message
                                : "Internal server error"
                            );
                          }
                        },
                      });
                  },
                },
              ],
            });
          await walletInsufficientBalanceExceptionAlert.present();
        },
        error: async (error: ResponseErrorDto) => {
          this.loading = false;
          this.notificationService.showErrorAlertNotification(
            error.message ? error.message : "Internal server error"
          );
        },
      });
  }

  isClientObjectExists(exchangeRates: CurrencyExchangeRate[], data: any) {
    return exchangeRates.some(
      (obj) =>
        obj.baseCurrency.currencyId === data.baseCurrency.currencyId &&
        obj.targetCurrency.currencyId === data.targetCurrency.currencyId
    );
  }

  onBuyPriceMismatchExceptionContinueButtonAlertClick(): void {
    this.loading = true;
    this.getProductInvoice$ = this.shopProductClient
      .getProductInvoice(
        this.branchId,
        this.selectedProduct.productId!,
        this.order.productPrice
      )
      .subscribe({
        next: (res: PriceInvoice) => {
          this.loading = false;
          this.unitPrice = res.sellAmount;
          this.openVerifyModal = true;
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
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

  getCurrencies(): void {
    this.getCurrencies$ = this.currenciesClient.getCurrencies().subscribe({
      next: (res) => {
        this.currencies = res;
      },
      error: (error: ResponseErrorDto) => {
        throw Error(error.message);
      },
    });
  }
  rateCurrency() {
    const baseCurrency =
      this.layoutService.branch?.merchant?.exchangeTargetCurrency;
    const selectedCurrency = this.selectedProduct.currency;
    const convertedObject = {
      baseCurrency: {
        currencyId: selectedCurrency.currencyId,
        currencyName: selectedCurrency.currencyName,
      },
      targetCurrency: {
        currencyId: baseCurrency?.currencyId,
        currencyName: baseCurrency?.currencyName,
      },
    };
    return [convertedObject];
  }

  ngOnDestroy(): void {
    this.exchangeSubject$.unsubscribe();
    this.getCategories$.unsubscribe();
    this.changeBranch$.unsubscribe();
    this.getProductInvoice$.unsubscribe();
    this.getProductSub$.unsubscribe();
    this.getCurrencies$.unsubscribe();
  }
}
