import { Component, OnInit } from '@angular/core';
import { ResponseErrorDto } from '@app/core/dto/core.dto';
import { LoadingService } from '@app/core/services';
import { CurrenciesClient, CurrencyExchangeRate } from '@app/proxy/shop-proxy';
import { dictionary } from '@dictionary/dictionary';

@Component({
  selector: 'app-exchange-rate',
  templateUrl: './exchange-rate.component.html',
  styleUrls: ['./exchange-rate.component.scss'],
})
export class ExchangeRateComponent implements OnInit {
  dictionary = dictionary;
  exchangeRateList: CurrencyExchangeRate[] = [];
  loading: boolean = false;

  constructor(
    private currencyClient: CurrenciesClient,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    this.getExchangeRate();
  }

  getExchangeRate() {
    this.loadingService.present();
    this.loading = true;
    this.currencyClient.getExchangeRates().subscribe({
      next: (res: CurrencyExchangeRate[]) => {
        this.exchangeRateList = res;
        this.loadingService.dismiss();
        this.loading = false;
      }, error: (error: ResponseErrorDto) => {
        this.loadingService.dismiss();
        this.loading = false;
        throw Error(error.message);
      }
    })
  }

}
