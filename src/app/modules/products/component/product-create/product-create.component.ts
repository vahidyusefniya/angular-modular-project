// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NotificationService } from "@app/core/services";
import {
  Category,
  CreateProductRequest,
  // ProductProvider,
  Region,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { environment } from "@environments/environment";
import { ModalController } from "@ionic/angular";
import { Subscription } from "rxjs";
import { ProviderDto } from "../../dto/product.dto";

@Component({
  selector: "app-product-create",
  templateUrl: "./product-create.component.html",
  styleUrls: ["./product-create.component.scss"],
})
export class ProductCreateComponent implements OnInit {
  dictionary = dictionary;
  product = new CreateProductRequest();
  imageUrl: string | undefined;
  uploadedFiles: any[] = [];
  uploadImageUrl = `${environment.Base__Url}/api/v1/system/upload-image`;
  openSelectCategoryModal = false;
  selectedCategoryName: string | undefined;
  autoFocus: boolean = false;
  getCurrencySub$ = new Subscription();
  openSelectRegionModal = false;
  selectedRegion: Region | undefined;
  selectedRegionName: string | undefined;

  @Input() isOpen = false;
  @Input() providers: ProviderDto[] = [];
  @Input() categories: Category[] = [];

  @Output() newProduct = new EventEmitter<any>();
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    if (this.categories.length == 1) {
      this.product.categoryId = this.categories[0].categoryId;
    }
  }

  chooseCategory(category: Category): void {
    this.product.categoryId = category.categoryId;
    this.selectedCategoryName = category.categoryName;
  }

  chooseRegion(region: Region) {
    this.selectedRegionName = region.name;
    this.selectedRegion = region;
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onUpload(event: any) {
    this.uploadedFiles = [];
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.imageUrl = event.originalEvent.body;
    this.product.imageUrl = event.originalEvent.body;
    this.notificationService.showSuccessNotification(
      "upload image successfully"
    );
  }

  onNewProductClick(): void {
    this.modalCtrl.dismiss();
    this.newProduct.emit(this.product);
  }

  
  removeCategory(){
    this.product.categoryId = undefined as any;
  }
}
