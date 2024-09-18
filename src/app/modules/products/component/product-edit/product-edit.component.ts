// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NotificationService } from "@app/core/services";
import { Category, Product, Region } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { environment } from "@environments/environment";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-product-edit",
  templateUrl: "./product-edit.component.html",
  styleUrls: ["./product-edit.component.scss"],
})
export class ProductEditComponent implements OnInit {
  dictionary = dictionary;
  product = new Product();
  uploadedFiles: any[] = [];
  uploadImageUrl = `${environment.Base__Url}/api/v1/system/upload-image`;
  imageUrl: string | undefined;
  openSelectRegionModal = false;
  selectedRegion: Region | undefined;
  selectedRegionName: string | undefined;
  openSelectCategoryModal = false;
  selectedCategoryName: string | undefined;

  @Input() isOpen = false;
  @Input() selectedProduct: Product | undefined;
  @Input() categoryName: string | undefined;
  @Input() regionName: string | undefined;

  @Output() editProduct = new EventEmitter<Product>();
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    if (this.selectedProduct) {
      this.product.init(this.selectedProduct);
      this.imageUrl = this.product.imageUrl!;
    }
    if (this.categoryName) {
      this.selectedCategoryName = this.categoryName;
    }

    if (this.product.regions?.length! > 0) {
      this.selectedRegion = this.product.regions![0];
      this.selectedRegionName = this.product.regions![0].name;
    }
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

  chooseRegion(region: Region) {
    this.product.regions = [region];
    this.selectedRegionName = region.name;
    this.selectedRegion = region;
  }

  chooseCategory(category: Category): void {
    this.product.categoryId = category.categoryId;
    this.selectedCategoryName = category.categoryName;
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onEditProductClick(): void {
    this.modalCtrl.dismiss();
    this.editProduct.emit(this.product);
  }
}
