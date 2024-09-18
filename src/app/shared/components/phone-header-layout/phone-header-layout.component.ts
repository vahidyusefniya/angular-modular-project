// noinspection JSIgnoredPromiseFromCall

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from "@angular/core";
import { CoreService } from "@app/core/services";
import { dictionary } from "@dictionary/dictionary";
import { NavController } from "@ionic/angular";
import { PhoneHeaderLayoutService } from "./phone-header-layout.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-phone-header-layout",
  templateUrl: "./phone-header-layout.component.html",
  styleUrls: ["./phone-header-layout.component.scss"],
})
export class PhoneHeaderLayoutComponent implements OnChanges, OnDestroy {
  dictionary = dictionary;
  showHeader = true;
  placeholder = "../../../../assets/img/placeholder.jpg";
  branchId: number | undefined;
  clearSearch$ = new Subscription();

  @Input() showFlagButton = false;
  @Input() showSearchBar = false;
  @Input() searchValue: string | undefined;
  @Input() flagImage: string | undefined;
  @Input() title: string | undefined;
  @Input() showBackButton = false;
  @Input() backEvent = false;
  @Input() showMenu = true;
  @Input() showHeaderLogo = false;
  @Input() dismiss = false;
  @Input() searchbarId = "searchbar";
  @Input() searchBarPlaceholder = "Search item";

  @Output() search = new EventEmitter();
  @Output() flagClick = new EventEmitter();
  @Output() moreClick = new EventEmitter();
  @Output() backClick = new EventEmitter();

  constructor(
    private router: NavController,
    private coreService: CoreService,
    private phoneHeaderLayoutService: PhoneHeaderLayoutService
  ) {
    this.branchId = this.coreService.getBranchId();
    this.clearSearch$ = this.phoneHeaderLayoutService.clearSearch$.subscribe(
      () => {
        this.onClear();
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["dismiss"]?.currentValue) this.onClear();
  }

  onFlagClick(): void {
    this.flagClick.emit();
  }
  onMenuClick(): void {
    this.router.navigateForward(
      `/branches/${this.branchId}/mobile-app-settings`
    );
  }

  onBackClick(): void {
    this.onClear();
    if (this.backEvent) this.backClick.emit();
    else this.router.back({ animated: false });
  }

  changeSearchInput(event: any): void {
    const value = event.target.value;
    this.searchValue = value;
    this.search.emit(this.searchValue);
  }
  onFocus(): void {
    this.showHeader = false;
  }
  onBlur(): void {
    this.showHeader = true;
  }

  onClear() {
    this.searchValue = undefined;
    if (!this.searchValue) this.search.emit(this.searchValue);
  }

  ngOnDestroy(): void {
    this.clearSearch$.unsubscribe();
  }
}
