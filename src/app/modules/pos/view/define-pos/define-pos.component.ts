import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ResponseErrorDto } from '@app/core/dto/core.dto';
import { CoreService, LoadingService, NotificationService } from '@app/core/services';
import { LayoutService } from '@app/layout';
import { CreatePosRequest, Pos, PosesClient, UpdatePosRequest } from '@app/proxy/proxy';
import { dictionary } from '@dictionary/dictionary';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-define-pos',
  templateUrl: './define-pos.component.html',
  styleUrls: ['./define-pos.component.scss'],
})
export class DefinePosComponent  implements OnInit {
  dictionary = dictionary;
  initPage$ = new Subscription();
  posAction$ = new Subscription();
  loading: boolean = false;
  branchId: number;
  merchantId: number;
  page = 1;
  pageSize = 10;
  cols: any[] = [
    {
      field: "name",
      header: dictionary.Name,
    },
    {
      field: "price",
      header: dictionary.Price,
    },
  ];
  poses: Pos[] = []
  pos = new Pos()
  showNewPos: boolean = false
  showEditPos: boolean = false
  constructor(
    private coreService: CoreService,
    private layoutService: LayoutService,
    private titleService: Title,
    private router: Router,
    private posesClient: PosesClient,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {

    this.branchId = this.coreService.getBranchId()!;
    this.merchantId = this.coreService.getMerchantId(this.branchId)!;
    this.layoutService.checkPagePermission("PosWrite");
  }

  ngOnInit() {
    this.initPage();
  }

  initPage(): void {
    this.loading = true;
    this.initPage$ = this.posesClient.getPoses(this.page, this.pageSize).subscribe({
      next: (res) => {
        this.loading = false;
        this.poses = res
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        throw Error(error.message);
      },
    });
  }

  onRefreshClick() {
    this.initPage()
  }

  onExcelExportClick() {
    this.loading = true;
    this.initPage$ = this.posesClient.getPoses(-1).subscribe({
      next: (res) => {
        this.loading = false;
        let temp = []
        temp = res.map((item) => {
          return {
            ...item,
            currency: item.currency.currencyName
          }
        })
        this.coreService.exportExcel(temp, dictionary.POS);
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        throw Error(error.message);
      },
    });
    
  }

  onEditPos(pos: UpdatePosRequest) {
    this.loadingService.present()
    this.posAction$ = this.posesClient.update(this.pos.posId, pos)
    .subscribe({
      next: (response: Pos) => {
        this.notificationService.showSuccessNotification(
          dictionary.PosUpdated
        );
      },
      error: (error: ResponseErrorDto) => {
        this.loadingService.dismiss()
        throw Error(error.message)
      },
      complete: () => {
        this.initPage()
        this.loadingService.dismiss()
      }
    })
  }

  createPos(pos: CreatePosRequest) {
    this.loadingService.present()
    this.posAction$ = this.posesClient.create(pos)
    .subscribe({
      next: (response: Pos) => {
        this.notificationService.showSuccessNotification(
          dictionary.PosCreated
        );
      },
      error: (error: ResponseErrorDto) => {
        this.loadingService.dismiss()
        throw Error(error.message)
      },
      complete: () => {
        this.initPage()
        this.loadingService.dismiss()
      }
    })
  }

  editPos(pos: Pos) {
    this.pos = new Pos(pos)
    this.showEditPos = true
  }

  ngOnDestroy(): void {
    this.initPage$.unsubscribe();
  }
}
