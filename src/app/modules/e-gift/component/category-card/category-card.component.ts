import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CategoryProduct } from "@app/proxy/shop-proxy";
import { dictionary } from "@dictionary/dictionary";

@Component({
  selector: "category-card",
  templateUrl: "./category-card.component.html",
  styleUrls: ["./category-card.component.scss"],
})
export class CategoryCardComponent {
  dictionary = dictionary;
  localImageSRC = "../../../../../assets/img/placeholder.jpg";
  localCategoryLevelTowImageSRC =
    "../../../../../assets/img/category__level__2.png";

  @Input() category!: CategoryProduct;
  @Input() id: number = 0;
  @Input() categoryLevel: "one" | "tow" = "one";

  @Output() categoryClick = new EventEmitter<number>();

  onCategoryClick(): void {
    this.categoryClick.emit(this.id);
  }
}
