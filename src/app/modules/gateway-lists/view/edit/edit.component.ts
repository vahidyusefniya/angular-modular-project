import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  Branch,
  GatewayList,
  GatewayListsClient,
  PaymentProfile,
  PaymentProfileCreateRequest,
  PutGatewayListRequest,
  SystemClient,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { forkJoin, map, Observable, of, Subscription, switchMap } from "rxjs";
import { IPaymentProfile } from "../../dto/gatewayLists.dto";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.component.html",
  styleUrls: ["./edit.component.scss"],
})
export class EditComponent implements OnInit {
  dictionary = dictionary;
  loading = false;
  branchId: number | undefined;
  isDark: boolean = false;
  cols: any[] = [
    {
      field: "paymentProfileName",
      header: dictionary.Name,
    },
    {
      field: "providerImage",
      header: dictionary.Provider,
    },
    {
      field: "isActive",
      header: dictionary.Active,
    },
    {
      field: "allSubCustomerState",
      header: dictionary.AllSubCustomer,
    },
  ];
  merchants: Branch[] = [];
  initPage$ = new Subscription();
  providers: IPaymentProfile[] = [];
  name: any;
  gatewayListId: number | undefined;
  gatewayList: GatewayList | undefined;
  hasGatewayListWritePermission: string | undefined;

  constructor(
    private coreService: CoreService,
    private layoutService: LayoutService,
    private loadingService: LoadingService,
    private gatewayListClient: GatewayListsClient,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private titleService: Title,
    private systemClient: SystemClient
  ) {
    this.branchId = this.coreService.getBranchId();
    this.layoutService.checkPagePermission("RoleRead");
    this.activatedRoute.params.subscribe((params) => {
      this.gatewayListId = Number(params["gatewayListId"]);
    });
    this.hasGatewayListWritePermission = this.layoutService
      .getPermissions()
      .find((permission) => permission === "GatewayListWrite");
  }

  ngOnInit() {
    this.layoutService.checkPagePermission("GatewayListWrite");
    this.isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.initPage();
    this.initBreadcrumbs();
  }

  initBreadcrumbs() {
    this.layoutService.setBreadcrumbs([
      {
        url: `/branches/${this.branchId}/gateway-lists`,
        deActive: false,
        label: dictionary.GatewayLists,
      },
      {
        url: `/branches/${this.branchId}/gateway-lists/${this.gatewayListId}`,
        deActive: false,
        label: dictionary.Detail,
      },
    ]);
  }

  initTitle(result: GatewayList) {
    this.titleService.setTitle(
      `${result.name} - ${dictionary.GateWayList} - ${this.layoutService.branchName}`
    );
  }

  initPage() {
    this.loadingService.present();

    this.initPage$ = this.gatewayListClient
      .get(this.branchId!, this.gatewayListId!)
      .subscribe({
        next: (res: GatewayList) => {
          this.gatewayList = res;
          this.name = res.name;
          this.layoutService.setBreadcrumbVariable(`${res.name}`);
          this.initTitle(res);
          this.loadingService.dismiss();
          this.getProviders();
        },
        error: (error: ResponseErrorDto) => {
          throw Error(error.message);
        },
      });
  }

  getProviders() {
    this.loadingService.present();
    this.initPage$ = this.systemClient
      .getPaymentProfiles()
      .pipe(
        switchMap((providers) => {
          if (providers.length === 0) {
            this.loadingService.dismiss();
            this.providers = [];
          }
          return this.preloadIcons(providers).pipe(
            map((icons) => ({ providers, icons }))
          );
        })
      )
      .subscribe({
        next: ({ providers, icons }) => {
          this.loadingService.dismiss();
          this.providers = providers.map(
            (item: PaymentProfile): IPaymentProfile => {
              const provider =
                this.gatewayList?.gatewayListPaymentProfiles.find(
                  (x) =>
                    x.paymentProfile.paymentProfileId === item.paymentProfileId
                );
              const iconUri = this.isDark ? item.imageUri2 : item.imageUri1;
              return {
                paymentProfileId: item.paymentProfileId,
                paymentProfileName: item.name,
                providerImage: icons[iconUri!],
                isActive: !!provider,
                allSubCustomerState: !!provider?.useForSubMerchants,
              };
            }
          );

          const trueArray = this.providers.filter((x) => x.isActive);
          const falseArray = this.providers.filter((x) => !x.isActive);
          this.providers = [...trueArray, ...falseArray];
        },
        error: (error: ResponseErrorDto) => {
          throw Error(error.message);
        },
      });
  }
  preloadIcons(
    providers: PaymentProfile[]
  ): Observable<{ [key: string]: string }> {
    const iconRequests = providers.map((provider) => {
      const iconUri = this.isDark ? provider.imageUri2 : provider.imageUri1;
      if (!iconUri) {
        // Handle case where iconUri is null or undefined
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

  onEditGatewayList() {
    this.loadingService.present();
    const request = new PutGatewayListRequest();
    let paymentProfileCreate = new PaymentProfileCreateRequest();
    request.name = this.name;
    this.providers
      .filter((x) => x.isActive)
      .forEach((item) => {
        paymentProfileCreate = new PaymentProfileCreateRequest({
          paymentProfileId: item.paymentProfileId,
          useForSubMerchants: item.allSubCustomerState,
        });
        request.paymentProfiles.push(paymentProfileCreate);
      });
    this.gatewayListClient
      .put(this.branchId!, this.gatewayListId!, request)
      .subscribe({
        next: (res) => {
          this.loadingService.dismiss();
          this.notificationService.showSuccessNotification(
            `Gateway List ${request.name} successfully updated.`
          );

          this.router.navigate([`/branches/${this.branchId}/gateway-lists`]);
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  changeIsActiveStatus(item: IPaymentProfile) {
    const index = this.providers.findIndex(
      (x) => x.paymentProfileId === item.paymentProfileId
    );
    if (!item.isActive) {
      this.providers[index].allSubCustomerState = false;
    }
  }

  ngOnDestroy(): void {}
}
