import { HttpClient } from "@angular/common/http";
import {
  AfterViewInit,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  Provider,
  ViewChild,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Phone } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { IonInput } from "@ionic/angular";
import { MaskitoElementPredicateAsync, MaskitoOptions } from "@maskito/core";
interface ICountry {
  name: string;
  code: string;
  mask: any;
  id: number;
  brief: string;
}

const TEXT_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MobileComponent),
  multi: true,
};
@Component({
  selector: "app-mobile",
  templateUrl: "./mobile.component.html",
  styleUrls: ["./mobile.component.scss"],
  providers: [TEXT_CONTROL_VALUE_ACCESSOR],
})
export class MobileComponent implements ControlValueAccessor, AfterViewInit {
  phoneNumber = "";
  country: ICountry = {
    id: 28,
    brief: "CAN",
    name: "Canada",
    code: "1",
    mask: [
      /\d/,
      /\d/,
      /\d/,
      " ",
      /\d/,
      /\d/,
      /\d/,
      " ",
      /\d/,
      /\d/,
      /\d/,
      /\d/,
    ],
  };
  showCountryModal: boolean = false;
  changeState: boolean = false;
  dictionary = dictionary;
  phoneMask: MaskitoOptions = {
    mask: [/\d/, /\d/, /\d/, " ", /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/],
  };

  @Input() code: any = "";
  @Input() customCss!: any;
  @Input() Label!: string;
  @Input() placeholder!: string;
  @Input() color: string | undefined;
  @Input() helperText: string | undefined;
  @Input() type: "text" | "number" | "password" = "text";
  @Input() errorText: string | undefined;
  @Input() autocomplete = "off";
  @Input() id = "text";
  @Input() required = false;
  @Input() autofocus = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() clearInput = false;
  @Input() maxlength = 100000;
  @Input() debounce = 0;
  @Input() minlength = 0;
  @Input() email = false;
  @Input() pattern = "";
  @Input() inputmode: string | undefined;
  @Input() isPreventNavigateNumber: boolean = false;
  @ViewChild("baseInput") baseInput!: IonInput;

  constructor(private http: HttpClient) {}

  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) =>
    (el as HTMLIonInputElement).getInputElement();

  @Output() inputChange = new EventEmitter();
  @Output() keypress = new EventEmitter<any>();
  @Output() blur = new EventEmitter<any>();
  @Output() ionInput = new EventEmitter<any>();

  @Input() value: string | undefined;
  showPassword: boolean = false;

  private onTouched!: Function;
  private onChanged!: Function;

  ngAfterViewInit(): void {
    if (this.autofocus) {
      setTimeout(async () => {
        this.baseInput.setFocus();
      }, 500);
    }
  }

  ngOnInit() {
    if (this.code != "") {
      this.http
        .get<ICountry[]>("assets/country.json")
        .subscribe((response: ICountry[]) => {
          const countries = response.map((item, index) => {
            return {
              ...item,
              code: item.code.replace("+", ""),
              mask: item.mask
                .replaceAll("-", " ")
                .split("")
                .map((maskItem: string) => {
                  return maskItem === "X" ? /\d/ : " ";
                }),
              id: index + 1,
            };
          });
          const temp = countries.filter((x) => x.code == this.code);
          this.country = temp[0];
        });
    }
  }
  writeValue(value: string): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onBlur(event: any): void {
    this.blur.emit(event);
  }

  onKeypress(event: any): void {
    this.keypress.emit(event);
  }

  showModal() {
    this.showCountryModal = true;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  countrySubmit(country: ICountry) {
    this.country = country;
    this.code = country.code;
    this.phoneMask = {
      mask: this.country.mask,
    };
  }

  onInputChange(event: any) {
    const newValue = event.detail.value;
    const data = new Phone({
      countryCode: this.country.code,
      number: newValue.replace(/\s+/g, ""),
    });
    this.inputChange.emit(data);
  }
}
