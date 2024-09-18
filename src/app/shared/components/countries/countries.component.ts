import { HttpClient } from "@angular/common/http";
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { CoreService } from "@app/core/services";
import { dictionary } from "@dictionary/dictionary";
import { IonInput, ModalController } from "@ionic/angular";
import { Subscription } from "rxjs";
interface ICountry {
  name: string
  code: string
  mask: any
  id?: number
  brief: string
}

@Component({
  selector: "app-countries",
  templateUrl: "./countries.component.html",
  styleUrls: ["./countries.component.scss"],
})
export class CountriesComponent implements OnInit {
  dictionary = dictionary;
  initPage$ = new Subscription()
  countries: ICountry[] = [];
  allCountries: ICountry[] = []
  debounce: any = null
  loading: boolean = false
  @ViewChild("searchInput") searchInput!: IonInput;

  @Input() country!: ICountry;
  @Input() isOpen = false;

  @Output() dismiss = new EventEmitter();
  @Output() countrySubmit = new EventEmitter();

  constructor(
    private coreService: CoreService,
    private modalCtrl: ModalController,
    private http: HttpClient
  ) {
    
  }

  ngAfterViewInit(): void {
    setTimeout(async () => {
      this.searchInput.setFocus();
    }, 200);
  }

  ngOnInit(): void {
    this.http.get<ICountry[]>('assets/country.json').subscribe((response: ICountry[]) => {
      this.countries = response.map((item, index) => {
        return {
          ...item,
          code: item.code.replace('+',''),
          mask: item.mask.replaceAll('-', ' ').split('').map((maskItem: string) => { return maskItem === 'X' ? /\d/ : ' ' }),
          id: index + 1
        }
      })
      this.allCountries = this.countries
    })
    
  }

  onClickSave(): void {
    this.countrySubmit.emit(this.country)
    this.modalCtrl.dismiss();
  }

  searchName(countrySearchTerm: any) {
    const countryValue = countrySearchTerm?.target?.value
    if(countryValue.trim().length > 0){
      this.loading = true
      this.countries = [...this.allCountries]
      .filter(x=> x.name.toUpperCase()
      .includes(countryValue.toUpperCase()) || 
      x.code.includes(countryValue) ||
      x.brief.includes(countryValue.toUpperCase())
      )
      this.loading = false
    }else{
      this.countries = [...this.allCountries]
    }
    
  }

  onFocusCountry(country: ICountry) {
    this.country = country
    this.onClickSave()
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
