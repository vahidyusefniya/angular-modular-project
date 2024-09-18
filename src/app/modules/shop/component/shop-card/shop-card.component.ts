import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ShopCardType } from "../../dto/shop.dto";
import { CoreService } from "@app/core/services";
import { PriceRangeDto } from "@app/proxy/shop-proxy";
import { ShopService } from "../../service/shop.service";

@Component({
  selector: "app-shop-card",
  templateUrl: "./shop-card.component.html",
  styleUrls: ["./shop-card.component.scss"],
})
export class ShopCardComponent implements OnInit {
  dictionary = dictionary;
  coreService$: CoreService;
  localImageSRC = "../../../../../assets/img/placeholder.jpg";
  localCategoryLevelTowImageSRC =
    "../../../../../assets/img/category__level__2.png";
  favorite = false;
  width = 0;

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.width = event.target.innerWidth;
  }

  @Input() data: any;
  @Input() categoryLevel: "one" | "tow" = "one";
  @Input() type: ShopCardType = "category";
  @Input() id: number = 0;

  @Output() descriptionClick = new EventEmitter<any>();
  @Output() buyClick = new EventEmitter<any>();

  constructor(
    private coreService: CoreService,
    private shopService: ShopService
  ) {
    this.coreService$ = this.coreService;
  }
  ngOnInit(): void {
    this.width = window.innerWidth;
  }

  getCalcStartValue(faceValue: PriceRangeDto): number {
    return this.shopService.getCalcStartValue(faceValue);
  }
  getCalcEndValue(faceValue: PriceRangeDto): number | undefined {
    if (!faceValue.end) return undefined;
    return this.shopService.getCalcEndValue(faceValue);
  }
  getCalcDiscountValue(faceValue: PriceRangeDto): number | undefined {
    return this.shopService.getCalcDiscountValue(faceValue);
  }

  onDescriptionClick(event?: Event): void {
    if (event) event.stopImmediatePropagation();
    this.descriptionClick.emit(this.data);
  }
  onBuyClick(): void {
    this.buyClick.emit(this.data);
  }

  onFavoriteClick(event: Event): void {
    event.stopImmediatePropagation();
    this.favorite = !this.favorite;
  }
}
