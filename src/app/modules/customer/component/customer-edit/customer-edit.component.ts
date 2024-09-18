import { HttpClient } from "@angular/common/http";
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { CoreService } from "@app/core/services";
import {
  MerchantAddress,
  PatchOfPhone,
  PatchOfString,
  Phone,
  UpdateMerchantRequest,
  UpdateSubMerchantRequest,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { combineLatest, Subscription } from "rxjs";
import { ITimezone } from "../../dto/customer.dto";
import { IRadioSelect } from "@app/shared/components/inputs/radio-list/radioList.model";

@Component({
  selector: "app-customer-edit",
  templateUrl: "./customer-edit.component.html",
  styleUrls: ["./customer-edit.component.scss"],
})
export class CustomerEditComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  branchId: number;
  customerMerchantId: number | undefined;
  customer = new UpdateSubMerchantRequest();
  addressObj = new MerchantAddress();

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

  initPage$ = new Subscription();

  @Input() isOpen = false;
  @Input() editCustomerData = new UpdateSubMerchantRequest();

  @Output() dismiss = new EventEmitter();
  @Output() editCustomer = new EventEmitter();

  constructor(
    private coreService: CoreService,
    private modalCtrl: ModalController,
    private http: HttpClient
  ) {
    this.branchId = this.coreService.getBranchId()!;
  }

  ngOnInit() {
    this.customer = this.editCustomerData;
    this.initPage();
  }

  initPage(): void {
    this.initPage$ = combineLatest({
      countries: this.http.get<IRadioSelect[]>("assets/countries.json"),
      states: this.http.get<IRadioSelect[]>("assets/states.json"),
      cities: this.http.get<IRadioSelect[]>("assets/cities.json"),
      timezones: this.http.get<ITimezone[]>("assets/timezones.json"),
    }).subscribe((data) => {
      this.countries = data.countries;
      this.statesList = data.states;
      this.citiesList = data.cities;
      this.timezones = data.timezones;
      this.addressObj = new MerchantAddress(this.customer.address!);
      if (this.addressObj.country) {
        this.countryName = this.addressObj.country;
        this.country = data.countries.find((c) => c.name === this.countryName);
        this.selectCountry(this.country!);
      }
      if (this.addressObj.state) {
        this.stateName = this.addressObj.state;
        this.state = data.states.find((s) => s.name === this.stateName);
        this.selectState(this.state!);
      }
      if (this.addressObj.city) {
        this.cityName = this.addressObj.city;
        this.city = data.cities.find((c) => c.name === this.cityName);
        this.selectCity(this.city!);
      }
      if (this.customer.timeZone?.value) {
        this.timezone = this.timezones.find(
          (item) => item.code === this.customer.timeZone?.value
        );
        this.timezoneName = `${this.timezone?.time_diff}  ${this.timezone?.code}`;
      }
    });
  }

  onClickSave(): void {
    this.customer.address = this.addressObj;
    this.editCustomer.emit(this.customer);
    this.modalCtrl.dismiss();
  }

  phoneNumberChange(value: Phone) {
    this.customer.phoneNumber = new PatchOfPhone({
      value: new Phone({
        countryCode: value.countryCode,
        number: value.number,
      }),
    });
  }

  whatsappNumberChange(value: Phone) {
    this.customer.whatsappNumber = new PatchOfPhone({
      value: new Phone({
        countryCode: value.countryCode,
        number: value.number,
      }),
    });
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
    let timeZone = new PatchOfString();
    timeZone.value = value.code;
    this.customer.timeZone = timeZone;
    this.timezone = value;
    this.timezoneName = `${value.time_diff}  ${value.code}`;
  }

  onDismiss(): void {
    this.dismiss.emit();
    this.modalCtrl.dismiss();
  }

  ngOnDestroy(): void {
    this.initPage$.unsubscribe();
  }
}
