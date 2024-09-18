import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CoreService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { ProductShopDto } from "@app/modules/shop/dto/shop.dto";
import { ProductBuyPrice } from "@app/proxy/shop-proxy";
import { PhoneHeaderLayoutService } from "@app/shared/components";
import { dictionary } from "@dictionary/dictionary";
import { EGiftService } from "../../service/e-gift.service";

@Component({
  selector: "app-search-view",
  templateUrl: "./search-view.component.html",
  styleUrls: ["./search-view.component.scss"],
})
export class SearchViewComponent {
  dictionary = dictionary;
  products: ProductShopDto[] = [];
  productsTemp: ProductShopDto[] = [];
  openOrderModal = false;
  selectedProduct!: ProductShopDto;
  searchValue: string | undefined;
  branchId: number;
  title: string | undefined;
  categoryId: number | undefined;

  constructor(
    private activatedRoute: ActivatedRoute,
    private eGiftService: EGiftService,
    public coreService: CoreService,
    private layoutService: LayoutService,
    private phoneHeaderLayoutService: PhoneHeaderLayoutService
  ) {
    this.branchId = coreService.getBranchId()!;
  }

  ionViewDidEnter(): void {
    this.searchValue =
      this.activatedRoute.snapshot.queryParamMap.get("search")!;
    this.title = this.activatedRoute.snapshot.queryParamMap.get("title")!;
    this.categoryId = Number(
      this.activatedRoute.snapshot.queryParamMap.get("categoryId")!
    );

    this.productsTemp = this.getUniqeProducts(
      this.eGiftService.getAllProducts()
    );

    this.initProducts();
  }
  initProducts(): void {
    const rootCategory = this.layoutService.rootCategory;
    if (this.categoryId && !isNaN(this.categoryId)) {
      const category = this.eGiftService.findCategory(
        rootCategory!,
        this.categoryId
      );
      if (!category) return;
      this.products = this.getUniqeProducts(category.productBuyPrices);
    }
    if (this.searchValue) {
      this.products = this.getProductSearchResult(this.searchValue);
    }
  }

  createOrder(product: ProductShopDto): void {
    this.selectedProduct = product;
    this.openOrderModal = true;
  }

  onInputSearch(value: string | undefined): void {
    if (!value || value === "") this.products = this.productsTemp;
    else {
      this.products = [];
      this.products = this.getProductSearchResult(value);
    }
  }

  getProductSearchResult(search: string): ProductShopDto[] {
    let products = this.eGiftService.filterProduct(
      this.layoutService.rootCategory!,
      search
    );
    return this.getUniqeProducts(products);
  }
  getUniqeProducts(products: ProductBuyPrice[]): ProductShopDto[] {
    const shopProducts: ProductShopDto[] = [];
    products = [
      ...new Map(products.map((item) => [item["productName"], item])).values(),
    ];
    products.forEach((product) => {
      if (product.faceValues) {
        product.faceValues.forEach((faceValue: any) => {
          if (shopProducts.length == 0) {
            shopProducts.push({
              currency: product.currency,
              faceValue: faceValue,
              imageUrl: product.imageUrl!,
              productId: product.productId,
              productName: product.productName,
              hasDescription: product.hasDescription,
            });
          } else {
            const index = shopProducts.findIndex(
              (t) => t.faceValue.faceValue == faceValue.faceValue
            );
            if (index != -1 && faceValue.end !== null) {
              shopProducts[index] = {
                currency: product.currency,
                faceValue: {
                  faceValue: faceValue.faceValue,
                  endValue: faceValue.endValue,
                  consumerFee: faceValue.consumerFee,
                  consumerTax: faceValue.consumerTax,
                  end:
                    shopProducts[index].faceValue.end! > faceValue.end!
                      ? shopProducts[index].faceValue.end!
                      : faceValue.end!,
                  start:
                    shopProducts[index].faceValue.start! < faceValue.start!
                      ? shopProducts[index].faceValue.start!
                      : faceValue.start!,
                  init(_data: any) {},
                  toJSON(data: any) {},
                  isEndless: faceValue.isEndless,
                },
                imageUrl: product.imageUrl!,
                productId: product.productId,
                productName: product.productName,
                hasDescription: product.hasDescription!,
              };
            } else {
              shopProducts.push({
                currency: product.currency,
                faceValue: faceValue,
                imageUrl: product.imageUrl!,
                productId: product.productId,
                productName: product.productName,
                hasDescription: product.hasDescription,
              });
            }
          }
        });
      }
    });
    return shopProducts;
  }

  ionViewDidLeave(): void {
    this.phoneHeaderLayoutService.onClearSearchInput();
  }
}
