// noinspection JSIgnoredPromiseFromCall

import { HttpClient } from "@angular/common/http";
import { Component, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  Branch,
  CreateMerchantRequest,
  GatewayList,
  GatewayListsClient,
  MerchantAddress,
  MerchantsClient,
  Phone,
  PriceList,
  PriceListsClient,
  SaleManager,
  SaleManagersClient,
  TeamClient,
} from "@app/proxy/proxy";
import { IRadioSelect } from "@app/shared/components/inputs/radio-list/radioList.model";
import { dictionary } from "@dictionary/dictionary";
import { IonInput } from "@ionic/angular";
import { CustomerService } from "@modules/customer/service/customer.service";
import { Subscription, combineLatest, lastValueFrom } from "rxjs";

interface ITimezone {
  id: number;
  code: string;
  time_diff: string;
  time_diff_summer: string;
}

@Component({
  selector: "app-create-customer",
  templateUrl: "./create-customer.component.html",
  styleUrls: ["./create-customer.component.scss"],
})
export class CreateCustomerComponent {
  dictionary = dictionary;
  branchId: number;
  parentPriceListId: number;
  customerMerchantId: number | undefined;
  postalCode: string | undefined;
  customer = new CreateMerchantRequest();
  addressObj = new MerchantAddress();
  createCustomer$ = new Subscription();
  initPage$ = new Subscription();

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

  showTimezoneModal: boolean = false;
  timezoneName: string = "";
  timezones: ITimezone[] = [];
  timezone: ITimezone | undefined;

  priceLists: PriceList[] = [];
  saleManagers: SaleManager[] = [];
  gatewayLists: GatewayList[] = [];

  @ViewChild("merchantNameInput") merchantNameInput!: IonInput;

  constructor(
    private coreService: CoreService,
    private customerService: CustomerService,
    private merchantsClient: MerchantsClient,
    private notificationService: NotificationService,
    private priceListsClient: PriceListsClient,
    private layoutService: LayoutService,
    private gatewayListsClient: GatewayListsClient,
    private saleManagersClient: SaleManagersClient,
    private loadingService: LoadingService,
    private titleService: Title,
    private http: HttpClient,
    private router: Router,
    private teamClient: TeamClient
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.parentPriceListId = this.layoutService.getParentPriceListId();
  }

  ngOnInit() {
    this.initTitle();
    this.initPage();
  }

  ngAfterViewInit(): void {
    setTimeout(async () => {
      this.merchantNameInput.setFocus();
    }, 1000);
  }

  initTitle() {
    this.titleService.setTitle(
      `${dictionary.NewCustomer} - ${dictionary.Customer} - ${this.layoutService.branchName}`
    );
  }

  initPage(): void {
    this.loadingService.present();
    this.initPage$ = combineLatest({
      priceLists: this.priceListsClient.get(
        this.branchId,
        this.parentPriceListId
      ),
      gatewayLists: this.gatewayListsClient.getGatewayLists(this.branchId),
      saleManagers: this.saleManagersClient.getSaleManagers(this.branchId),
      countries: this.http.get<IRadioSelect[]>("assets/countries.json"),
      states: this.http.get<IRadioSelect[]>("assets/states.json"),
      cities: this.http.get<IRadioSelect[]>("assets/cities.json"),
      timezones: this.http.get<ITimezone[]>("assets/timezones.json"),
    }).subscribe((data) => {
      this.loadingService.dismiss();
      this.initPriceLists(data.priceLists);
      this.initGatewayLists(data.gatewayLists);
      this.initSaleManagers(data.saleManagers);
      this.countries = data.countries;
      this.statesList = data.states;
      this.citiesList = data.cities;
      this.timezones = data.timezones;
    });
  }

  initPriceLists(data: PriceList): void {
    this.priceLists = [];
    this.priceLists.push(data);
    data.priceLists?.forEach((item) => {
      this.priceLists.push(item);
    });

    if (this.priceLists.length == 1) {
      this.customer.priceListId = this.priceLists[0].priceListId;
    }
  }

  initGatewayLists(data: GatewayList[]): void {
    this.gatewayLists = data;
  }
  initSaleManagers(data: SaleManager[]): void {
    this.saleManagers = data;
  }

  onClickSave(): void {
    let u =
      Date.now().toString(16) + Math.random().toString(16) + "0".repeat(16);
    let guid = [
      u.substr(0, 8),
      u.substr(8, 4),
      "4000-8" + u.substr(13, 3),
      u.substr(16, 12),
    ].join("-");

    this.customer.externalReference = guid;
    this.customer.parentBranchId = this.branchId;
    this.customer.address = this.addressObj;
    this.createCustomerMethod();
  }

  createCustomerMethod() {
    this.loadingService.present();
    this.createCustomer$ = this.merchantsClient
      .create(this.branchId, this.customer)
      .subscribe({
        next: async () => {
          try {
            this.notificationService.showSuccessNotification(
              this.dictionary.CreatedCustomerSuccessFully
            );
            const branches: Branch[] = await lastValueFrom(
              this.teamClient.getMerchantsBranch()
            );
            this.layoutService.updateBranches(branches);
            this.loadingService.dismiss();
            this.router.navigate([`/branches/${this.branchId}/customers`]);
          } catch (error: any) {
            this.loadingService.dismiss();
            throw Error(error.message);
          }
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  whatsappNumberChange(value: Phone) {
    this.customer.whatsappNumber = value;
  }

  phoneNumberChange(value: Phone) {
    this.customer.phoneNumber = value;
  }

  selectCountry(value: IRadioSelect) {
    this.addressObj.country = value.name;
    this.country = value;
    this.countryName = value?.name;
    this.state = undefined;
    this.stateName = "";
    this.city = undefined;
    this.cityName = "";
    this.states = [...this.statesList].filter((x) => x.countryId === value.id);
  }
  selectState(value: IRadioSelect) {
    this.addressObj.state = value.name;
    this.state = value;
    this.stateName = value?.name;
    this.city = undefined;
    this.cityName = "";
    this.cities = [...this.citiesList].filter((x) => x.stateId === value.id);
  }
  selectCity(value: IRadioSelect) {
    this.addressObj.city = value.name;
    this.city = value;
    this.cityName = value?.name;
  }

  selectTimezone(value: ITimezone) {
    this.customer.timeZone = value.code;
    this.timezone = value;
    this.timezoneName = `${value.time_diff}  ${value.code}`;
  }
}
