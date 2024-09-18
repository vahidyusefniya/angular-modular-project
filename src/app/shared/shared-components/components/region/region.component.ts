// noinspection JSIgnoredPromiseFromCall

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService } from "@app/core/services";
import { Region, RegionsClient } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { IonModal } from "@ionic/angular";
import { Subscription } from "rxjs";

@Component({
  selector: "app-region",
  templateUrl: "./region.component.html",
  styleUrls: ["./region.component.scss"],
})
export class RegionComponent implements OnInit {
  dictionary = dictionary;
  regions: Region[] = [];
  allRegions: Region[] = [];
  selectedRegionName: string | undefined;
  region = new Region();
  localImageSRC = "../../../../../assets/img/placeholder.jpg";
  getRegions$ = new Subscription();
  searchText: string = "";
  loading = false;

  @Input() isOpen = false;
  @Input() selectedRegion: Region | undefined;

  @Output() chooseRegion = new EventEmitter<Region>();
  @Output() dismiss = new EventEmitter();

  @ViewChild("regionModal") regionModal!: IonModal;

  constructor(
    private regionsClient: RegionsClient,
    public coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.initRegions();
  }

  initRegions(): void {
    this.loading = true;
    this.getRegions$ = this.regionsClient.getRegions().subscribe({
      next: (res) => {
        this.loading = false;
        this.region.init({
          regionId: null,
          name: "All",
          code: "all",
          imageUrl: `../../../../assets/img/country/all.png`,
        });
        this.regions = [this.region, ...res];
        this.allRegions = this.regions;
        this.selectedRegionName = this.selectedRegion
          ? this.selectedRegion.name
          : this.regions[0].name;
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        throw Error(error.message);
      },
    });
  }

  setRegion(region: Region): void {
    this.region = region;
    this.chooseRegion.emit(this.region);
    this.regionModal.dismiss();
  }

  onSearchRegion(event: any): void {
    const value = event;
    if (!value) this.regions = [...this.allRegions];
    else {
      const searchItems = [...this.allRegions];
      this.regions = searchItems.filter((s) =>
        s.name?.toLocaleLowerCase().includes(value.toLocaleLowerCase())
      );
    }
  }

  onDismiss(): void {
    this.regionModal.dismiss();
    this.dismiss.emit();
  }
}
