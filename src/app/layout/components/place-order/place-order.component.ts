// noinspection JSIgnoredPromiseFromCall

import { HttpClient } from "@angular/common/http";
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService, LoadingService, NotificationService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { BasketProductShopDto, Checkout, ProductShopDto } from "@app/modules/shop/dto/shop.dto";
import { PriceListsClient, BuyOrderDeliveryType, PhysicalCardsClient, PlacePhysicalCardOrderRequest, PhysicalCardOrderItem, Phone } from "@app/proxy/proxy";
import { PriceInvoice, ProductsClient } from "@app/proxy/shop-proxy";
import { IRadioSelect } from "@app/shared/components/inputs/radio-list/radioList.model";
import { dictionary } from "@dictionary/dictionary";
import { AlertController, IonInput, ModalController } from "@ionic/angular";
import { MaskitoElementPredicateAsync, MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";
import { Subscription, combineLatest } from "rxjs";

@Component({
  selector: "app-place-order",
  templateUrl: "./place-order.component.html",
  styleUrls: ["./place-order.component.scss"],
})
export class PlaceOrderComponent implements OnInit {
  dictionary = dictionary;
  branchId!: number;
  placePhysicalCardOrderRequest = new PlacePhysicalCardOrderRequest()

  showCountryModal: boolean = false;
  countryName: string = "";
  country: IRadioSelect | undefined;
  countries: IRadioSelect[] = [];

  showStateModal: boolean = false;
  stateName: string = "";
  statesList: IRadioSelect[] = [];
  states: IRadioSelect[] = [];
  state: IRadioSelect | undefined;

  showCityModal: boolean = false;
  cityName: string = "";
  citiesList: IRadioSelect[] = [];
  cities: IRadioSelect[] = [];
  city: IRadioSelect | undefined;
  initPage$ = new Subscription()
  @Input() isOpen = false;
  @Input() products: BasketProductShopDto[] = [];

  // @Input() product!: BasketProductShopDto;

  @Output() dismiss = new EventEmitter();
  @Output() submit = new EventEmitter<any>();
  @ViewChild("fullNameInput") fullNameInput!: IonInput;

  constructor(
    private modalController: ModalController,
    private coreService: CoreService,
    private loadingService: LoadingService,
    private productsClient: ProductsClient,
    private http: HttpClient,
    private physicalCardsClient: PhysicalCardsClient,
    private notificationService: NotificationService,
    private alertController: AlertController,
    private router: Router
  ) {
    this.branchId = this.coreService.getBranchId()!;
  }

  ngAfterViewInit(): void {
    setTimeout(async () => {
      this.fullNameInput.setFocus();
    }, 200);
  }

  ngOnInit(): void {
    this.initPage$ = combineLatest({
      countries: this.http.get<IRadioSelect[]>("assets/countries.json"),
      states: this.http.get<IRadioSelect[]>("assets/states.json"),
      cities: this.http.get<IRadioSelect[]>("assets/cities.json"),
    }).subscribe((data) => {
      this.countries = data.countries;
      this.statesList = data.states;
      this.citiesList = data.cities;
    });
  }

  phoneNumberChange(value: Phone) {
    this.placePhysicalCardOrderRequest.shipping.phoneNumber = value;
  }

  onSubmitClick() {
    this.loadingService.present()
    
    this.products.forEach(item => {
      this.placePhysicalCardOrderRequest.physicalCardOrderItems.push(new PhysicalCardOrderItem({
        productId: item?.productId!,
        quantity: item?.quantity!,
        productPrice: item?.faceValue.end !== null ? null : item?.faceValue.start!,
      }))
    })

    this.physicalCardsClient.placeOrder(this.branchId, this.placePhysicalCardOrderRequest).subscribe({
      next: async (res) => {
        this.notificationService.showSuccessNotification(`Order ${res} has been registered successfully.`)

        const alert = await this.alertController.create({
          header: dictionary.SuccessOrder!,
          message: `Order ${res} has been submitted successfully.`,
          animated: false,
          cssClass: "success-buy-alert",
          buttons: [
            {
              text: dictionary.ViewOrders,
              role: "confirm",
              cssClass: "info-alert-btn",
              handler: () => {
                this.router.navigate([
                  `/branches/${this.branchId}/physical-gift-cards/orders`,
                ]);
              },
            },
            {
              text: dictionary.ContinueShopping,
              role: "cancel",
              cssClass: "primary-alert-btn",
            },
          ],
        });

        await alert.present();
        this.submit.emit()
        this.onDismiss()
      },
      error: (error: ResponseErrorDto) => {
        this.loadingService.dismiss()
      },
      complete: () => {
        this.loadingService.dismiss()
      }
    })
  }

  selectCountry(value: IRadioSelect) {
    this.placePhysicalCardOrderRequest.shipping.address.country = value.name;
    this.country = value;
    this.countryName = value?.name;
    this.state = undefined;
    this.stateName = "";
    this.city = undefined;
    this.cityName = "";
    this.states = [...this.statesList].filter((x) => x.countryId === value.id);
  }

  selectState(value: IRadioSelect) {
    this.placePhysicalCardOrderRequest.shipping.address.state = value.name;
    this.state = value;
    this.stateName = value?.name;
    this.city = undefined;
    this.cityName = "";
    this.cities = [...this.citiesList].filter((x) => x.stateId === value.id);
  }
  selectCity(value: IRadioSelect) {
    this.placePhysicalCardOrderRequest.shipping.address.city = value.name;
    this.city = value;
    this.cityName = value?.name;
  }

  onDismiss(): void {
    this.isOpen = false;
    this.dismiss.emit();
    this.modalController.dismiss();
  }
}
