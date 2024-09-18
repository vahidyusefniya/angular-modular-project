import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PhoneHeaderLayoutService {
  clearSearch$ = new Subject<void>();

  onClearSearchInput(): void {
    this.clearSearch$.next();
  }
}
