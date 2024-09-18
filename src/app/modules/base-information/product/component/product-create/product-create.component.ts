// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { LoadingService, NotificationService } from "@app/core/services";
import {
  Category,
  CurrenciesClient,
  Currency,
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
  product: any;
  imageUrl: string | undefined;
  uploadedFiles: any[] = [];
  uploadImageUrl = `${environment.Base__Url}/api/v1/system/upload-image`;
  openSelectCategoryModal = false;
  openSelectRegionModal = false;
  selectedCategoryName: string | undefined;
  currencies: Currency[] = [];
  autoFocus: boolean = false;
  getCurrencySub$ = new Subscription();
  selectedRegionName: string | undefined;
  selectedRegion: Region | undefined;

  @Input() isOpen = false;
  @Input() providers: ProviderDto[] = [];
  @Input() categories: Category[] = [];

  @Output() newProduct = new EventEmitter<any>();
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private notificationService: NotificationService,
    private currenciesClient: CurrenciesClient,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.getCurrencies();
    this.product.providerId = "EzPin";
    this.product.regionIds = [0];
    if (this.categories.length == 1) {
      this.product.categoryId = this.categories[0].categoryId;
    }
  }

  getCurrencies(): void {
    this.loadingService.present();
    this.getCurrencySub$ = this.currenciesClient.getCurrencies().subscribe({
      next: (res) => {
        this.currencies = res;
        setTimeout(() => {
          var input = document.querySelector(".productName input");
          // @ts-ignore
          input.focus();
        }, 500);
        if (this.currencies.length == 1) {
          this.product.currencyId = this.currencies[0].currencyId;
        }
      },
      error: (error: ResponseErrorDto) => {
        this.loadingService.dismiss();
        throw Error(error.message);
      },
      complete: () => {
        this.loadingService.dismiss();
      },
    });
  }

  chooseCategory(category: Category): void {
    this.product.categoryId = category.categoryId;
  }

  chooseRegion(region: Region) {
    this.product.regionIds = [region.regionId];
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
