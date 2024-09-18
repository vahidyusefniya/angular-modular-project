import { Injectable } from '@angular/core';
import { SaleManager } from '@app/proxy/proxy';
import { dictionary } from '@dictionary/dictionary';

@Injectable({
  providedIn: 'root'
})
export class SalesManagerService {
  dictionary = dictionary;
  saleManager: SaleManager | undefined;

  set setSaleManager(data: SaleManager) {
    this.saleManager = data;
  }

  get getSaleManager(): SaleManager | undefined {
    return this.saleManager;
  }

  getUtcDateTimeForFilterDatePicker(date: string | undefined) {
    if (!date) return dictionary.Empty;
    let midNight = new Date(date).setHours(0, 0, 1, 0);
    return new Date(new Date(midNight).getTime()).toISOString();
  }

}
