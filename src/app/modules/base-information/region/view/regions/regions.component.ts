// noinspection JSIgnoredPromiseFromCall

import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService, LoadingService, NotificationService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { Region, RegionsClient, UpdateRegionRequest } from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { Subscription } from "rxjs";

@Component({
  selector: "app-regions",
  templateUrl: "./regions.component.html",
  styleUrls: ["./regions.component.scss"],
})
export class RegionsComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  loading = false;
  getRegions$ = new Subscription();
  showRegionForm: boolean = false;
  showEditRegionForm: boolean = false;
  regionForm = new Region();
  region = new Region();
  page = 1;
  pageSize = 12;
  cols: ICol[] = [
    {
      field: "name",
      header: dictionary.Name,
      hasLinkRow: true,
      isRouteLink: false,
      linkRowPermission: "CurrencyWrite",
      width: "auto",
      hidden: false,
    },
    {
      field: "code",
      header: dictionary.Code,
      hasNormalRow: true,
      isRouteLink: false,
      linkRowPermission: "CurrencyWrite",
      width: "auto",
      hidden: false,
    },
  ];
  regions: Region[] = [];
  allRegions: Region[] = [];
  updatedRegion = new UpdateRegionRequest()

  constructor(
    private regionsClient: RegionsClient,
    private notificationService: NotificationService,
    private layoutService: LayoutService,
    private coreService: CoreService,
    private titleService: Title,
    private loadingService: LoadingService
  ) {
    this.layoutService.setTabName(
      `${dictionary.Regions} - ${dictionary.System}`
    );
    this.layoutService.checkPagePermission("CurrencyRead");
  }

  ngOnInit() {
    this.initRegions();
  }

  onEditRegionClick(model: any): void {
    this.regionForm = { ...model.data };
    this.showEditRegionForm = true;
  }

  showNewRegionForm() {
    this.regionForm = new Region();
    this.showRegionForm = true;
  }

  submitCreate(model: Region): void {
    this.loading = true;
    this.regions = [];
    this.showRegionForm = false;
    this.getRegions$ = this.regionsClient.create(model).subscribe({
      next: () => {
        this.notificationService.showSuccessNotification(
          this.dictionary.CreatedRegionSuccessFully
        );
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        throw Error(error.message);
      },
      complete: () => {
        this.initRegions();
      },
    });
  }

  submitUpdate(model: Region) {
    this.loading = true;
    this.regions = [];
    this.showEditRegionForm = false;
    
    this.updatedRegion?.init({
      name: {
        value: model.name
      },
      imageUrl: {
        value: model.imageUrl
      },
      code: {
        value: model.code
      }
    })

    this.getRegions$ = this.regionsClient
      .update(model.regionId, this.updatedRegion)
      .subscribe({
        next: () => {
          this.notificationService.showSuccessNotification(
            `${model.name} edited.`
          );
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          throw Error(error.message);
        },
        complete: () => {
          this.initRegions();
        },
      });
  }

  initRegions(): void {
    this.loading = true;
    this.regionForm = new Region();
    this.getRegions$ = this.regionsClient.getRegions().subscribe({
      next: (res) => {
        this.regions = [...res]
        this.allRegions = this.regions
        this.loading = false;
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        throw Error(error.message);
      },
    });
  }

  onExcelExportClick(): void {
    // this.loading = true;
    this.loadingService.present()
    this.getRegions$ = this.regionsClient
      .getRegions( )
      .subscribe({
        next: (res) => {
          let regions = res.map((item) => ({
            regionId: item.regionId,
            regionName: item.name,
            code: item.code
          }));
          this.coreService.exportExcel(regions, dictionary.Regions);
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss()
          // this.loading = false;
          throw Error(error.message);
        },
        complete: () => {
          this.loadingService.dismiss()
          // this.loading = false;
        },
      });
  }

  onRefreshClick(): void {
    this.initRegions();
  }

  ngOnDestroy(): void {
    this.getRegions$.unsubscribe();
  }
}
