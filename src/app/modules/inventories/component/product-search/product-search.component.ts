// noinspection JSIgnoredPromiseFromCall

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Product, ProductSummary } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { IonSearchbar, ModalController } from "@ionic/angular";

@Component({
  selector: "app-product-search",
  templateUrl: "./product-search.component.html",
  styleUrls: ["./product-search.component.scss"],
})
export class ProductSearchComponent implements OnInit {
  dictionary = dictionary;
  @Input() products: ProductSummary[] = [];
  @Input() isOpen = false;
  @Input() searchProductLoading = false;

  @Output() dismiss = new EventEmitter();
  @Output() select = new EventEmitter<Product>();
  @Output() searchEvent = new EventEmitter<string>();

  @ViewChild("searchInput") searchInput!: IonSearchbar;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.setFocus();
      }
    }, 200);
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
  searchProduct(event: any) {
    this.searchEvent.emit(event.target.value);
  }

  selectProduct(product: Product) {
    this.select.emit(product);
    this.onDismiss();
  }
}
