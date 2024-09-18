import { HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import {
  CoreService,
  ITag,
  LoadingService,
  NotificationService,
  TagService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  CreateSaleManagerRequest,
  SaleManager,
  SaleManagersClient,
} from "@app/proxy/proxy";
import {
  ICol
} from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { Observable, Subscription } from "rxjs";
import {
  ISaleManagerFilterDto,
  SaleManagerFilterDto,
} from "../../dto/sales-manager.dto";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"],
})
export class ListComponent implements OnInit {
  dictionary = dictionary;
  salesManager: any[] = [];
  loading = false;
  openActiveFilter: boolean = false;
  salesManagerFilter = new SaleManagerFilterDto();
  tagList: ITag[] = [];
  cols: ICol[] = [
    {
      field: "name",
      header: dictionary.Name,
      hasLinkRow: true,
      isRouteLink: false,
      linkRowPermission: "ProductRead",
      width: "auto",
      hidden: false,
    },
    {
      field: "isActive",
      header: dictionary.Status,
      hasNormalRow: true,
      width: "auto",
      hidden: false,
    },
  ];
  page = 1;
  pageSize = 10;
  branchId: number;
  openNewModal = false;
  changeTagList$ = new Subscription();
  removeTag$ = new Subscription();

  constructor(
    private coreService: CoreService,
    private router: Router,
    private saleManagerService: SaleManagersClient,
    private notificationService: NotificationService,
    private layoutService: LayoutService,
    private tagService: TagService,
    private activatedRoute: ActivatedRoute,
    private loadingService: LoadingService
  ) {
    this.branchId = coreService.getBranchId()!;
    this.changeTagList$ = tagService.changeTagList.subscribe((tags: ITag[]) => {
      this.tagList = tags;
    });
    this.removeTag$ = this.tagService.removeTag$.subscribe((key: string) => {
      if (key == dictionary.Status) {
        this.salesManagerFilter.isActive = undefined;
      }
      this.updateRouteParameters(this.salesManagerFilter);
      this.getSaleManagersData(
        this.salesManagerFilter.isActive!,
        this.page,
        this.pageSize
      ).subscribe({
        next: (res: SaleManager[]) => {
          this.salesManager = res.map((sale) => ({
            ...sale,
            isActive: sale.isActive ? dictionary.Active : dictionary.Deactive,
          }));
        },
        error: (err) => {
          throw Error(err.message);
        },
        complete: () => {
          this.loading = false;
        },
      });
    });
  }

  ngOnInit() {
    this.initPage(this.salesManagerFilter);
  }

  getSaleManagersData(
    isActive: boolean | null,
    page: number | undefined,
    pageSize: number | undefined
  ): Observable<SaleManager[]> {
    return this.saleManagerService.getSaleManagers(
      this.branchId,
      isActive,
      page,
      pageSize
    );
  }

  initPage(filter: SaleManagerFilterDto) {
    const params = this.getUrlParams();
    this.loading = true;
    if (params) {
      this.salesManagerFilter.init(params);
      this.getSaleManagersData(
        filter.isActive!,
        this.page,
        this.pageSize
      ).subscribe({
        next: (res: SaleManager[]) => {
          this.salesManager = res.map((sale) => ({
            ...sale,
            isActive: sale.isActive ? dictionary.Active : dictionary.Deactive,
          }));
          this.creatTag(this.salesManagerFilter);
          this.updateRouteParameters(this.salesManagerFilter);
        },
        error: (err) => {
          throw Error(err.message);
        },
        complete: () => {
          this.loading = false;
        },
      });
    } else {
      this.getSaleManagersData(
        filter.isActive!,
        this.page,
        this.pageSize
      ).subscribe({
        next: (res: SaleManager[]) => {
          this.salesManager = res.map((sale) => ({
            ...sale,
            isActive: sale.isActive ? dictionary.Active : dictionary.Deactive,
          }));
        },
        error: (err) => {
          throw Error(err.message);
        },
        complete: () => {
          this.loading = false;
        },
      });
    }
  }

  getUrlParams(): ISaleManagerFilterDto | undefined {
    if (!location.href.includes("?")) return;
    const httpParams = new HttpParams({
      fromString: location.href.split("?")[1],
    });
    const isActiveString = httpParams.get("isActive")!;
    const isActive = isActiveString ? isActiveString === "true" : undefined;
    let tags: ISaleManagerFilterDto;
    tags = {
      isActive,
    };

    return tags;
  }

  createTagFromUrlParams(): void {
    setTimeout(() => {
      const params = this.getUrlParams()!;
      if (params) this.creatTag(params);
    }, 200);
  }

  onRefreshClick() {
    this.initPage(this.salesManagerFilter);
  }

  onCreateSaleManager(saleManagerData: CreateSaleManagerRequest) {
    this.loadingService.present();
    this.saleManagerService.create(this.branchId, saleManagerData).subscribe({
      next: (res: SaleManager) => {
        this.openNewModal = false;
        this.loadingService.dismiss();
        this.initPage(this.salesManagerFilter);
        this.notificationService.showSuccessNotification(dictionary.SaleManagerCreateSuccessfully);
      },
      error: (err) => {
        this.loadingService.dismiss();
        throw Error(err.message);
      },
    });
  }

  onExcelExportClick(): void {
    // this.loading = true;
    this.loadingService.present()
    this.getSaleManagersData(
      this.salesManagerFilter.isActive!,
      -1,
      undefined
    ).subscribe({
      next: (res: SaleManager[]) => {
        this.coreService.exportExcel(res, "salesManagerlist");
      },
      error: (err) => {
        this.loadingService.dismiss()
        throw Error(err.message);
      },
      complete: () => {
        this.loadingService.dismiss()
        // this.loading = false;
      },
    });
  }

  onAdvancedFilterClick(): void {
    this.openActiveFilter = true;
  }

  saveActiveFilter(data: SaleManagerFilterDto) {
    this.salesManagerFilter.init(data);
    this.getSaleManagersData(
      this.salesManagerFilter.isActive!,
      this.page,
      this.pageSize
    ).subscribe({
      next: (res: SaleManager[]) => {
        this.salesManager = res.map((sale) => ({
          ...sale,
          isActive: sale.isActive ? dictionary.Active : dictionary.Deactive,
        }));
        this.creatTag(this.salesManagerFilter);
        this.updateRouteParameters(this.salesManagerFilter);
      },
      error: (err) => {
        throw Error(err.message);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  creatTag(data: any) {
    const isActive: ITag = {
      key: dictionary.Status,
      value: data.isActive ? dictionary.Active : dictionary.Deactive,
      clearable: true,
    };
    this.tagService.createTags([isActive]);
  }

  updateRouteParameters(filter: SaleManagerFilterDto) {
    const params: Params = {
      isActive: filter.isActive,
    };
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: params,
      queryParamsHandling: "merge",
    });
  }

  linkRowClick(data: any): void {
    this.router.navigate([
      `/branches/${this.branchId}/sale-managers/${data.saleManagerId}/assigned-customers`,
    ]);
  }
}
