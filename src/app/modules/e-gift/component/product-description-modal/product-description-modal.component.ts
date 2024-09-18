import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IDescirption } from "@app/modules/shop/dto/shop.dto";
import { dictionary } from "@dictionary/dictionary";

@Component({
  selector: "app-product-description-modal",
  templateUrl: "./product-description-modal.component.html",
  styleUrls: ["./product-description-modal.component.scss"],
})
export class ProductDescriptionModalComponent {
  dictionary = dictionary;

  @Input() isOpen = false;
  @Input() descriptions: IDescirption[] = [];

  @Output() dismiss = new EventEmitter();

  onDismiss(): void {
    this.isOpen = false;
    this.dismiss.emit();
  }
}
