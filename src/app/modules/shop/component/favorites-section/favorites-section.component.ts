import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { Product } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ProductShopDto } from "../../dto/shop.dto";

@Component({
  selector: "app-favorites-section",
  templateUrl: "./favorites-section.component.html",
  styleUrls: ["./favorites-section.component.scss"],
})
export class FavoritesSectionComponent implements OnInit {
  dictionary = dictionary;
  products: Product[] = [];
  responsiveOptions: any[] | undefined;
  branchId: number;

  @Output() descriptionClick = new EventEmitter<ProductShopDto>();
  @Output() buyClick = new EventEmitter<ProductShopDto>();

  constructor(
    private layoutService: LayoutService,
    private coreService: CoreService,
  ) {
    this.responsiveOptions = [
      {
        breakpoint: "1400px",
        numVisible: 4,
        numScroll: 4,
      },
      {
        breakpoint: "1220px",
        numVisible: 3,
        numScroll: 3,
      },
      {
        breakpoint: "700px",
        numVisible: 2,
        numScroll: 2,
      },
      {
        breakpoint: "500px",
        numVisible: 1,
        numScroll: 1,
      },
    ];

    this.branchId = this.coreService.getBranchId()!;
  }

  ngOnInit() {
    const category = this.layoutService.rootCategory;
    if (category) {
      const categories = this.layoutService.rootCategory;
      if (categories && categories.categories!.length > 0) {
        // this.products = categories.categories![0].productBuyPrices;
      }
    }
  }

  onOpenDescriptionModalClick(data: any): void {
    this.descriptionClick.emit(data);
  }
  onOpenBuyModalClick(data: any): void {
    this.buyClick.emit(data);
  }
}
