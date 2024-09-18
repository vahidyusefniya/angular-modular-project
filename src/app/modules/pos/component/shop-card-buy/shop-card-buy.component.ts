import { HttpClient } from "@angular/common/http";
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  CreatePosOrderRequest,
  CreatePosRequest,
  Currency,
  PaymentProviderClient,
  PaymentProviderCustomerPanelLinkAccessType,
  PaymentProviderPaymentMethod,
  PaymentProviderProfile,
  Phone,
  Pos,
  PosOrderPaymentMethod,
  PosOrdersClient,
  Wallet,
  WalletsClient,
} from "@app/proxy/proxy";
import { IRadioSelect } from "@app/shared/components/inputs/radio-list/radioList.model";
import { dictionary } from "@dictionary/dictionary";
import { environment } from "@environments/environment";
import { IonInput, ModalController } from "@ionic/angular";
import { MaskitoElementPredicateAsync, MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";
import { Subscription, combineLatest } from "rxjs";
import { IAccountNumber } from "../../dto/pos.dto";
import { NgForm } from "@angular/forms";
import { TruncateDecimalsPipe } from "@app/shared/pipes";

@Component({
  selector: "app-shop-card-buy",
  templateUrl: "./shop-card-buy.component.html",
  styleUrls: ["./shop-card-buy.component.scss"],
})
export class ShopCardBuyComponent implements OnInit {
  dictionary = dictionary;
  loading = false;
  branchId: number | undefined;
  initPage$ = new Subscription();
  gatewayType: string = dictionary.CreditCard;
  loadingCustomerPanelLink: boolean = false;
  showCountryModal: boolean = false;
  paymentProviderCustomerPanelLinkAccessType =
    PaymentProviderCustomerPanelLinkAccessType;

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

  fullName: string | undefined;
  // phoneNumber: Phone | undefined;
  address: string | undefined;
  zipcode: string | undefined;
  model = new CreatePosOrderRequest();
  posOrderPaymentMethod = PosOrderPaymentMethod;
  errorTextQuantityInput: string | undefined;
  loadingWallet: boolean = false;
  walletBalance: number = 0;
  merchantId: number;
  accountNumbers: IAccountNumber[] = []
  paymentMethods: PaymentProviderPaymentMethod[] = []
  maxQuantity: number = 0
  truncateDecimalsPipe: TruncateDecimalsPipe | undefined
  @ViewChild("fullNameInput") fullNameInput!: IonInput;

  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) =>
    (el as HTMLIonInputElement).getInputElement();

  readonly thousandSeparator: MaskitoOptions = maskitoNumberOptionsGenerator({
    thousandSeparator: ",",
    precision: 0,
  });

  @Input() isOpen = false;
  @Input() pos: Pos | undefined;
  @Output() buy = new EventEmitter<CreatePosOrderRequest>();
  @Output() dismiss = new EventEmitter();
  @ViewChild("phoneNumber") phoneNumber!: IonInput;
  @ViewChild("posForm") posForm!: NgForm;
  
  constructor(
    private coreService: CoreService,
    private layoutService: LayoutService,
    private modalCtrl: ModalController,
    private loadingService: LoadingService,
    private http: HttpClient,
    private walletsClient: WalletsClient,
    private paymentProviderClient: PaymentProviderClient
  ) {
    this.branchId = this.coreService.getBranchId();
    this.merchantId = coreService.getMerchantId(this.branchId!)!;
  }

  ngAfterViewInit(): void {
    setTimeout(async () => {
      this.fullNameInput.setFocus();
    }, 200);
  }

  ngOnInit() {
    this.model.paymentMethod = this.posOrderPaymentMethod.CreditCard;
    this.initPage();
  }
  

  initPage(): void {
    this.loadingService.present();
    this.loadingWallet = true;
    this.initPage$ = combineLatest({
      countries: this.http.get<IRadioSelect[]>("assets/countries.json"),
      states: this.http.get<IRadioSelect[]>("assets/states.json"),
      cities: this.http.get<IRadioSelect[]>("assets/cities.json"),
      wallet: this.walletsClient.getWallet(this.branchId!),
      paymentMethods: this.paymentProviderClient.getMerchantPaymentMethods(
        this.branchId!,
        this.merchantId
      ),
    }).subscribe((data) => {
      this.loadingService.dismiss();
      this.countries = data.countries;
      this.statesList = data.states;
      this.citiesList = data.cities;
      this.paymentMethods = data.paymentMethods
      this.model.paymentMethod = this.posOrderPaymentMethod.CreditCard
      this.accountNumbers = [...this.paymentMethods].filter(x=> x.paymentMethodType === this.model.paymentMethod.toString()).map((item) => {
        return {
          paymentMethodProviderProfileId: item?.providerProfiles ? item?.providerProfiles[0].paymentMethodProviderProfileId! : undefined,
          paymentMethodNumber: item.paymentMethodNumber!
        }
      })
      const hasBalance = data.wallet.currencies?.some(x=> x.currency.currencyId === this.pos?.currency.currencyId)
      if(hasBalance) {
        const wallet = data.wallet.currencies?.find(x=> x.currency.currencyId === this.pos?.currency.currencyId)
        this.walletBalance = wallet?.balance!
        if(this.walletBalance > 0) {
          this.maxQuantity = Math.floor(this.walletBalance / this.pos?.price!)
        }else{
          this.maxQuantity = 0
        }
      }

      this.loadingWallet = false;
    });
  }

  phoneNumberChange(value: Phone) {
    this.model.shipping.phoneNumber = value;
  }

  onBuyClick() {
    this.buy.emit(this.model);
    this.onDismiss();
  }

  onInputQuantity() {
    let numberWithoutComma
    numberWithoutComma = !!this.model.quantity ? this.model.quantity.toString().replace(/,/g, "") : this.model.quantity
    if (Number(numberWithoutComma) === 0) {
      this.errorTextQuantityInput = `The quantity must be greater than 0`;
    } else if(Number(numberWithoutComma) > this.maxQuantity && this.model.paymentMethod === this.posOrderPaymentMethod.Wallet) {
      this.errorTextQuantityInput = `The quantity must be less than ${this.maxQuantity.toLocaleString()}`;
    }else {
      this.errorTextQuantityInput = "";
    }
  }

  setPaymentMethod(paymentMethod: PosOrderPaymentMethod) {
    this.model = new CreatePosOrderRequest();
    //@ts-ignore
    this.phoneNumber.baseInput.value = ""
    this.model.paymentMethod = paymentMethod
    let paymentMethodString = paymentMethod === this.posOrderPaymentMethod.Ach ? 'ElectronicCheck' : paymentMethod.toString()
    this.accountNumbers = [...this.paymentMethods].filter(x=> x.paymentMethodType === paymentMethodString).map((item) => {
      return {
        paymentMethodProviderProfileId: item?.providerProfiles ? item?.providerProfiles[0].paymentMethodProviderProfileId! : undefined,
        paymentMethodNumber: item.paymentMethodNumber!
      }
    })

    this.onInputQuantity()
    this.posForm.reset();
    this.model.paymentMethodProviderProfileId = null
  }

  createCustomerPanelLink() {
    this.loadingCustomerPanelLink = true;

    this.paymentProviderClient
      .getCustomerPanelLink(
        this.branchId!,
        this.merchantId,
        this.model?.paymentMethod === this.posOrderPaymentMethod.CreditCard
          ? this.paymentProviderCustomerPanelLinkAccessType.CreditCard
          : this.paymentProviderCustomerPanelLinkAccessType.ElectronicCheck
      )
      .subscribe({
        next: (response: string) => {
          window.location.href = response;
        },
        error: (error: ResponseErrorDto) => {
          throw Error(error.message);
        },
        complete: () => {},
      });
  }

  selectCountry(value: IRadioSelect) {
    this.model.shipping.address.country = value.name;
    this.country = value;
    this.countryName = value?.name;
    this.state = undefined;
    this.stateName = "";
    this.city = undefined;
    this.cityName = "";
    this.states = [...this.statesList].filter((x) => x.countryId === value.id);
  }

  selectState(value: IRadioSelect) {
    this.model.shipping.address.state = value.name;
    this.state = value;
    this.stateName = value?.name;
    this.city = undefined;
    this.cityName = "";
    this.cities = [...this.citiesList].filter((x) => x.stateId === value.id);
  }
  selectCity(value: IRadioSelect) {
    this.model.shipping.address.city = value.name;
    this.city = value;
    this.cityName = value?.name;
  }

  getTotalPrice(): number {
    if (this.model.quantity) {
      return (
        (this.model.quantity?.toString() as any).replace(/,/g, "") *
        (this.pos?.isSubscriptive! ? this.pos?.price! / this.pos?.installmentCount! : this.pos?.price!)
      );
    } else {
      return 0;
    }
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  ngOnDestroy(): void {
    this.initPage$.unsubscribe();
  }
}
