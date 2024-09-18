// noinspection JSIgnoredPromiseFromCall

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { CoreService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { BasketProductShopDto } from "@app/modules/shop/dto/shop.dto";
import { dictionary } from "@dictionary/dictionary";
import { Subscription } from "rxjs";

@Component({
  selector: "app-basket-items",
  templateUrl: "./basket-items.component.html",
  styleUrls: ["./basket-items.component.scss"],
})
export class BasketItemsComponent implements OnInit {
  dictionary = dictionary;
  localImageSRC = "../../../../../assets/img/placeholder.jpg";
  productCount: any = 1;
  branchId!: number;
  products: BasketProductShopDto[] = []
  showPlaceOrderModal: boolean = false

  @Input() isOpen = false;
  @Output() dismiss = new EventEmitter();

  constructor(
    private coreService: CoreService,
    private layoutService: LayoutService
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.layoutService.basketListener.subscribe((products) => {
      this.products = products
    })
    this.layoutService.showCheckoutModal.subscribe((showModal: boolean) => {
      this.showPlaceOrderModal = showModal
    })
    
  }

  ngOnInit(): void {}

  submitBasket() {
    this.layoutService.setDrawer(false)
    this.layoutService.clearBasketItems()
  }

  onDismiss(): void {
    this.layoutService.setDrawer(false)
  }
}
