import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Provider,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { LayoutService } from "@app/layout";
import { CurrenciesClient, Currency } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { Subscription } from "rxjs";

const CURRENCY_COMBOBOX_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CurrencyComboboxComponent),
  multi: true,
};

@Component({
  selector: "app-currency-combobox",
  templateUrl: "./currency-combobox.component.html",
  styleUrls: ["./currency-combobox.component.scss"],
  providers: [CURRENCY_COMBOBOX_CONTROL_VALUE_ACCESSOR],
})
export class CurrencyComboboxComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  loading = true;
  currencies: Currency[] = [];
  getProductsSub$ = new Subscription();
  value: number | undefined;
  isMobileSize = false;

  private onTouched!: Function;
  private onChanged!: Function;

  @Input() disabled = false;
  @Input() required = false;
  @Input() includeClear = true;

  @Output() selectionChange = new EventEmitter<Currency>();

  constructor(
    private currenciesClient: CurrenciesClient,
    private layoutService: LayoutService
  ) {
    this.isMobileSize = this.layoutService.checkMobileSize();
  }

  ngOnInit() {
    this.initCurrencies();
  }
  initCurrencies(): void {
    const me = this;
    this.getProductsSub$ = this.currenciesClient.getCurrencies().subscribe({
      next(res: Currency[]) {
        if (res.length == 1) {
          me.disabled = true;
          me.handleChange(res[0].currencyId);
        }
        me.sortCurrencies(res);
        me.loading = false;
      },
      error(error) {
        me.loading = false;
        throw Error(error.message);
      },
    });
  }
  sortCurrencies(data: Currency[]): void {
    let numberCurrencies: Currency[] = [];
    let reserveCurrencies: Currency[] = [];
    let currencies: Currency[] = [];
    for (let currency of data) {
      if (this.isNumberCurrency(currency)) {
        numberCurrencies.push(currency);
      } else if (this.isReserveCurrency(currency)) {
        reserveCurrencies.push(currency);
      } else {
        currencies.push(currency);
      }
    }
    currencies.sort((a, b) => a.currencyName.localeCompare(b.currencyName));
    reserveCurrencies = this.sortReserveCurrencies(reserveCurrencies);

    this.currencies = [...reserveCurrencies, ...currencies, ...numberCurrencies];
  }

  isReserveCurrency(currency: any): boolean {
    const reserveCurrencies = ["USD", "EUR", "CAD", "AED", "TRY", "GBP", "TST"];
    return reserveCurrencies.includes(currency.currencyName);
  }

  isNumberCurrency(currency: any): boolean {
    return !isNaN(Number(currency.currencyName));
  }

  sortReserveCurrencies(currencies: any[]): any[] {
    const reserveOrder = ["USD", "EUR", "CAD", "AED", "TRY", "GBP", "TST"];
    return currencies.sort((a, b) => reserveOrder.indexOf(a.currencyName) - reserveOrder.indexOf(b.currencyName));
  }

  handleChange(change: number): void {
    this.onTouched();
    this.writeValue(change);
    this.onChanged(change);
    const currency = this.currencies.find((c) => c.currencyId == change);
    this.selectionChange.emit(currency);
  }
  writeValue(value: any): void {
    this.value = value;
  }
  // noinspection JSUnusedGlobalSymbols
  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }
  // noinspection JSUnusedGlobalSymbols
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  ngOnDestroy(): void {
    this.getProductsSub$.unsubscribe();
  }
}
