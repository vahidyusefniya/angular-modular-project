import { HttpClient } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService, NotificationService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  Branch,
  GatewayList,
  GatewayListSummary,
  GatewayListsClient,
  Merchant,
  MerchantsClient,
  PaymentProfile,
} from "@app/proxy/proxy";
import { ICol } from "@app/shared/components/page-list/page-list.model";
import { dictionary } from "@dictionary/dictionary";
import { ActionSheetController } from "@ionic/angular";
import { forkJoin, map, Observable, of, Subscription, switchMap } from "rxjs";
import { CustomerService } from "../../service/customer.service";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-gateway-list",
  templateUrl: "./gateway-list.component.html",
  styleUrls: ["./gateway-list.component.scss"],
})
export class GatewayListComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  openAssignGatewayListModal: boolean = false;
  assignGatewayListModalTitle: string | undefined;
  assignedGatewayListName: string = dictionary.NoGatewayListAssigned;
  selectedMerchant = new Branch();
  branches: Branch[] = [];
  loading: boolean = false;
  assignedGatewayListId: number | undefined;
  page = 1;
  branchId: number;
  pageSize = 10;
  cols: ICol[] = [
    {
      width: "auto",
      hidden: false,
      field: "name",
      header: dictionary.Name,
    },
    {
      width: "auto",
      hidden: false,
      field: "providerIcon",
      header: dictionary.Provider,
    },
  ];
  getGatewayLists$ = new Subscription();
  get$ = new Subscription();
  gatewayList: GatewayList[] = [];
  paymentProfiles: PaymentProfile[] = [];
  isDark = false;
  gatewayLoading = true;
  isOpen = false;
  alertButtons = [
    {
      text: dictionary.Cancel,
      role: "cancel",
      handler: () => {
        this.isOpen = false;
      },
    },
    {
      text: dictionary.Unassign,
      role: "confirm",
      handler: () => {
        this.unassignGatewayList();
      },
    },
  ];
  unassignGatewayList$ = new Subscription();
  assignGatewayList$ = new Subscription();
  isSmallMode$ = new Subscription();
  isSmallMode = false;
  merchant: Merchant | undefined

  constructor(
    private layoutService: LayoutService,
    private customerService: CustomerService,
    private coreService: CoreService,
    private gatewayListsClient: GatewayListsClient,
    private notificationService: NotificationService,
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController,
    private titleService: Title,
    private merchantsClient: MerchantsClient
  ) {
    this.branches = this.layoutService.branches;
    this.branchId = this.coreService.getBranchId()!;
    this.selectedMerchant = this.customerService.branch!

    this.isSmallMode$ = this.layoutService.isSmallMode.subscribe(
      (isSmallMode) => {
        this.isSmallMode = isSmallMode;
      }
    );
    this.isSmallMode = this.layoutService.checkMobileSize();
  }

  ngOnInit() {
    this.initBreadcrumbs();
    this.initTitle();
    this.getMerchant();
    this.initGatewayLists();
    this.isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.initPaymentProfiles(this.branchId);
  }

  initBreadcrumbs() {
    this.layoutService.setBreadcrumbVariable(
      this.customerService.branch?.merchantName
    );

    this.layoutService.setBreadcrumbs([
      {
        url: `/branches/${this.branchId}/customers`,
        deActive: false,
        label: dictionary.Customers,
      },
      {
        url: `/branches/${this.branchId}/customers`,
        deActive: false,
        label: "",
      },
    ]);
  }
  initTitle() {
    this.titleService.setTitle(
      `${this.customerService.branch?.merchantName} - ${dictionary.Customer} - ${this.layoutService.branchName}`
    );
  }

  getMerchant() {
    this.loading = true
    this.merchantsClient
      .get(this.branchId, this.customerService.branch?.merchantId!, false)
      .subscribe({
        next: (res: Merchant) => {
          this.merchant = res;

          if (res.assignedGatewayList?.gatewayListId) {
            this.assignedGatewayListName = this.merchant.assignedGatewayList?.name!
            this.assignedGatewayListId = this.merchant.assignedGatewayList?.gatewayListId!
          }
        },
        error: (err) => {
          this.loading = false;
          throw Error(err.message);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  initPaymentProfiles(id: number): void {
    const me = this;
    this.loading = true;
    this.get$ = this.gatewayListsClient.getCustomerPaymentProfiles(id, this.selectedMerchant.merchantId)
      .pipe(
        switchMap((paymentProfiles) => {
          if (paymentProfiles.length === 0) {
            me.loading = false;
            me.paymentProfiles = [];
          }
          return this.preloadIcons(paymentProfiles).pipe(
            map((icons) => ({ paymentProfiles, icons }))
          );
        })
      )
      .subscribe({
        next({ paymentProfiles, icons }) {
          const paymentProfilesData: any[] = paymentProfiles.map((item) => {
            const iconUri = me.isDark ? item.imageUri2 : item.imageUri1;
            return {
              ...item,
              providerIcon: icons[iconUri!],
            };
          });
          me.paymentProfiles = paymentProfilesData;
        },
        error(error: ResponseErrorDto) {
          me.loading = false;
          throw Error(error.message);
        },
        complete() {
          me.loading = false;
        },
      });
  }
  initGatewayLists(): void {
    const me = this;
    this.getGatewayLists$ = this.gatewayListsClient
      .getGatewayLists(this.layoutService.branch?.branchId!)
      .subscribe({
        next(res: GatewayList[]) {
          me.gatewayLoading = false;
          me.gatewayList = res;
        },
        error(error: ResponseErrorDto) {
          me.gatewayLoading = false;
          throw Error(error.message);
        },
      });
  }
  preloadIcons(data: PaymentProfile[]): Observable<{ [key: string]: string }> {
    const iconRequests = data.map((paymentProfile) => {
      const iconUri = this.isDark
        ? paymentProfile.imageUri2
        : paymentProfile.imageUri1;
      if (!iconUri) {
        return of({ uri: "", content: "" });
      }
      if (iconUri.includes(".svg")) {
        return this.getSvgContent(iconUri).pipe(
          map((svgContent) => ({
            uri: iconUri,
            content: "data:image/svg+xml;base64," + btoa(svgContent),
          }))
        );
      } else {
        return of({ uri: iconUri, content: iconUri });
      }
    });

    return forkJoin(iconRequests).pipe(
      map((results) =>
        results.reduce((acc, curr) => {
          if (curr.uri) {
            acc[curr.uri] = curr.content;
          }
          return acc;
        }, {} as { [key: string]: string })
      )
    );
  }
  getSvgContent(svgPath: string): Observable<string> {
    return this.http.get(svgPath, {
      responseType: "text",
    });
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: this.initActionSheetItems(),
    });

    await actionSheet.present();
  }
  initActionSheetItems(): any[] {
    const permissions: string[] = this.layoutService.getPermissions();
    const isAssignGatewayListToMerchant = permissions.find(
      (p) => p === "AssignGatewayListToMerchant"
    );

    const items = [
      {
        id: 1,
        text: dictionary.AssignGatewayList,
        handler: () => {
          this.openAssignGatewayListModal = true;
        },
        permission: "AssignGatewayListToMerchant",
      },
      {
        id: 2,
        text: dictionary.UnassignGatewayList,
        handler: () => {
          this.isOpen = true;
        },
        permission: "AssignGatewayListToMerchant",
      },
      {
        text: dictionary.Cancel,
        role: "cancel",
        data: {
          action: "cancel",
        },
      },
    ];

    if (!isAssignGatewayListToMerchant) {
      const assignGatewayListIndex = items.findIndex((i) => i.id === 1);
      const unassignGatewayListIndex = items.findIndex((i) => i.id === 2);
      if (assignGatewayListIndex > -1 && unassignGatewayListIndex > -1) {
        items.splice(assignGatewayListIndex, 1);
        items.splice(unassignGatewayListIndex, 2);
      }
    }

    return items;
  }

  onAssignGatewayListClick(): void {
    this.assignGatewayListModalTitle = `${dictionary.AssignGatewayList} to "${this.customerService.branch?.merchant?.merchantName}"`;
    this.openAssignGatewayListModal = true;
  }
  assignGatewayList(data: GatewayList) {
    const me = this;
    this.loading = true;
    this.gatewayLoading = true;
    this.assignGatewayList$ = this.gatewayListsClient
      .assignToMerchant(
        this.layoutService.branch?.branchId!,
        data.gatewayListId,
        this.customerService.branch?.merchantId!
      )
      .subscribe({
        next() {
          me.loading = false;
          me.gatewayLoading = false;
          me.notificationService.showSuccessNotification(
            `Assign gateway list ${data.name} to merchant ${me.customerService.branch?.branchName} successfully.`
          );
          me.assignedGatewayListId = data.gatewayListId;
          me.assignedGatewayListName = data.name;
          me.getMerchant()
          me.initPaymentProfiles(me.branchId);
        },
        error(error: ResponseErrorDto) {
          me.loading = false;
          throw Error(error.message);
        },
      });
  }
  unassignGatewayList(): void {
    const me = this;
    this.loading = true;
    this.gatewayLoading = true;
    this.unassignGatewayList$ = this.gatewayListsClient
      .unAssignFromMerchant(
        this.layoutService.branch?.branchId!,
        this.assignedGatewayListId!,
        this.customerService.branch?.merchantId!
      )
      .subscribe({
        next() {
          me.loading = false;
          me.gatewayLoading = false;
          me.assignedGatewayListId = undefined;
          me.paymentProfiles = [];
          me.assignedGatewayListName = dictionary.NoGatewayListAssigned;
          me.notificationService.showSuccessNotification(
            "unassign gateway list successfully"
          );
          me.isOpen = false;
          me.initPaymentProfiles(me.branchId);
          me.getMerchant()
        },
        error(error: ResponseErrorDto) {
          me.loading = false;
          me.gatewayLoading = false;
          me.isOpen = false;
          throw Error(error.message);
        },
      });
  }

  onExcelExportClick() {
    if (this.paymentProfiles.length == 0) return;
    this.coreService.exportExcel(this.paymentProfiles, "gateway-list");
  }
  refreshClick(): void {
    this.gatewayLoading = true;
    this.loading = true;
    this.initPaymentProfiles(this.branchId);
    this.initGatewayLists();
  }

  ngOnDestroy(): void {
    this.getGatewayLists$.unsubscribe();
    this.getGatewayLists$.unsubscribe();
    this.unassignGatewayList$.unsubscribe();
    this.assignGatewayList$.unsubscribe();
    this.isSmallMode$.unsubscribe();
  }
}
