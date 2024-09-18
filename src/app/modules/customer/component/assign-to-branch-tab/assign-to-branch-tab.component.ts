import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  CoreService,
  LoadingService,
  NotificationService,
} from "@app/core/services";

import { HttpClient } from "@angular/common/http";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { LayoutService } from "@app/layout";
import { dictionary } from "@dictionary/dictionary";
import { AlertController, ModalController } from "@ionic/angular";
import { CustomerService } from "@modules/customer/service/customer.service";
import {
  Branch,
  BranchesClient,
  Merchant,
  MerchantsClient,
  MerchantAddress,
  PatchOfNullableBoolean,
  PatchOfPhone,
  PatchOfString,
  PatchOfUri,
  SaleManager,
  SaleManagersClient,
  TeamClient,
  UpdateMerchantRequest,
  UpdateSubMerchantRequest,
} from "@proxy/proxy";
import { Subscription, lastValueFrom } from "rxjs";
import { ITimezone } from "../../dto/customer.dto";

@Component({
  selector: "app-assign-to-branch-tab",
  templateUrl: "./assign-to-branch-tab.component.html",
  styleUrls: ["./assign-to-branch-tab.component.scss"],
})
export class AssignToBranchTabComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  walletId: number = 0;
  initPage$ = new Subscription();
  loading: boolean = false;
  branchId: number;
  initBranch$ = new Subscription();
  branches: Branch[] = [];
  showAssignToBranchModal: boolean = false;
  showAssignSaleMangerToMerchantModal: boolean = false;
  selectedBranch: Branch | undefined;
  merchant: Merchant | undefined;
  showAssignToOfficeBtn: boolean = false;
  selectedSaleManagerId!: number;
  showEditCustomerModal = false;
  customerEdit = new UpdateSubMerchantRequest();
  editCustomerSub$ = new Subscription();
  timezoneNumber: string | undefined;
  timezones: ITimezone[] = [];

  constructor(
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private coreService: CoreService,
    private branchesClient: BranchesClient,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private customerService: CustomerService,
    private layoutService: LayoutService,
    private titleService: Title,
    private router: Router,
    private saleManagerService: SaleManagersClient,
    private merchantService: MerchantsClient,
    private teamClient: TeamClient,
    private http: HttpClient
  ) {
    this.branchId = this.coreService.getBranchId()!;
  }

  async ngOnInit() {
    this.initTimezones();
    this.getMerchant();
    this.initBreadcrumbs();
    this.initTitle();
    const offices = await lastValueFrom(
      this.branchesClient.getSubBranches(this.branchId!)
    );

    if (offices.length > 0) {
      this.showAssignToOfficeBtn = true;
    }
  }

  getMerchant() {
    this.loadingService.present();
    this.loading = true;
    this.merchantService
      .get(this.branchId, this.customerService.branch?.merchantId!, false)
      .subscribe({
        next: (res: Merchant) => {
          this.merchant = res;
          const timezone = this.timezones.find((t) => t.code === res.timeZone);
          if (timezone) {
            this.timezoneNumber = `${timezone?.time_diff} ${timezone?.code}`;
          } else this.timezoneNumber = "-";

          this.selectedSaleManagerId =
            this.merchant.saleManager?.saleManagerId!;
        },
        error: (err) => {
          this.loading = false;
          this.loadingService.dismiss();
          throw Error(err.message);
        },
        complete: () => {
          this.loading = false;
          this.loadingService.dismiss();
        },
      });
  }
  initTimezones(): void {
    this.http.get<ITimezone[]>("/assets/timezones.json").subscribe((res) => {
      this.timezones = res;
    });
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

  onAssignToBranchClick() {
    this.loadingService.present();
    this.getBranches();
  }
  async getBranches() {
    this.initBranch$ = this.branchesClient
      .getSubBranches(this.branchId)
      .subscribe((data) => {
        this.loadingService.dismiss();
        if (data.length > 0) {
          this.branches = data;
          this.showAssignToBranchModal = true;
        } else {
          this.showNotHaveBranchAlert();
        }
      });
  }

  dismissAssignSaleMangerToMerchantModal(): void {
    this.showAssignSaleMangerToMerchantModal = false;
  }

  SelectedSaleManager(saleManager: SaleManager) {
    this.setSaleManager(saleManager);
  }

  changeActiveStatus(isActive: boolean) {
    return isActive ? dictionary.Active : dictionary.Deactive;
  }

  setSaleManager(saleManager: SaleManager) {
    this.loadingService.present();
    this.loading = true;
    this.saleManagerService
      .assignMerchants(
        this.branchId,
        saleManager.saleManagerId,
        [this.customerService.branch?.merchantId!],
        true
      )
      .subscribe({
        next: (res) => {
          this.notificationService.showSuccessNotification(
            `${this.customerService.branch?.merchantName} assigned to ${saleManager.name}.`
          );
          this.loadingService.dismiss();
          this.loading = false;
          this.getMerchant();
        },
        error: (err) => {
          this.loading = false;
          this.loadingService.dismiss();
          throw Error(err.message);
        },
      });
  }

  async showNotHaveBranchAlert() {
    const alert = await this.alertController.create({
      header: dictionary.AssignToBranch!,
      message: dictionary.DontHaveBranches,
      animated: false,
      cssClass: "assignToBranch__alert",
      buttons: [
        {
          text: dictionary.Close,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
      ],
    });

    await alert.present();
  }

  dismissAssignBranchModal(): void {
    this.selectedBranch = undefined;
    this.showAssignToBranchModal = false;
  }

  async assignToBranchConfirmation() {
    const alert = await this.alertController.create({
      header: dictionary.AssignToOffice!,
      message: `Do you want to give <b>${
        this.customerService.branch?.merchantName
      }</b> customer management to the <b>${
        this.selectedBranch!.branchName
      }</b> office?`,
      animated: false,
      cssClass: "assignToBranch__alert",
      buttons: [
        {
          text: dictionary.Close,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
        {
          text: dictionary.Assign,
          role: "confirm",
          cssClass: "primary-alert-btn",
          handler: () => {
            this.assignToBranch(this.selectedBranch!.branchName);
          },
        },
      ],
    });

    await alert.present();
  }

  setSelectedBranch(branch: Branch) {
    this.selectedBranch = branch;
  }

  assignToBranch(branchName: string) {
    this.modalCtrl.dismiss();
    this.loadingService.present();
    this.branchesClient
      .assignMerchant(
        this.selectedBranch!.branchId,
        this.customerService.branch?.merchantId!
      )
      .subscribe(() => {
        this.notificationService.showSuccessNotification(
          `${this.customerService.branch?.merchantName} assigned to ${branchName}.`
        );
        this.loadingService.dismiss();
        this.router.navigate([`/branches/${this.branchId}/customers`]);
      });
  }
  onEditClick(): void {
    const email = new PatchOfString();
    let address = new MerchantAddress();
    const website = new PatchOfUri();
    const phoneNumber = new PatchOfPhone();
    const whatsappNumber = new PatchOfPhone();
    const isActive = new PatchOfNullableBoolean();
    const timeZone = new PatchOfString();
    email.value = this.merchant?.email;
    address = this.merchant!.address!;
    website.value = this.merchant?.website;
    phoneNumber.value = this.merchant?.phoneNumber!;
    whatsappNumber.value = this.merchant?.whatsappNumber;
    isActive.value = this.merchant?.isActive;
    timeZone.value = this.merchant?.timeZone;
    this.customerEdit.address = address;
    this.customerEdit.website = website;
    this.customerEdit.phoneNumber = phoneNumber;
    this.customerEdit.whatsappNumber = whatsappNumber;
    this.customerEdit.isActive = isActive;
    this.customerEdit.email = email;
    this.customerEdit.timeZone = timeZone;
    this.showEditCustomerModal = true;
  }
  editCustomer(customer: UpdateSubMerchantRequest): void {
    this.loading = true;
    this.editCustomerSub$ = this.merchantService
      .updateSubMerchant(this.branchId, this.customerService.branch?.merchantId!, customer)
      .subscribe({
        next: (res) => {
          this.notificationService.showSuccessNotification("Customer edited");
          this.getMerchant();
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          throw Error(err.message);
        },
      });
  }

  async onUnassignClick() {
    const alert = await this.alertController.create({
      header: dictionary.UnAssignCustomer!,
      message: `Are you sure to unassign <b>${this.customerService.branch?.merchantName}</b> from <b>${this.merchant?.saleManager?.name}</b>?`,
      animated: false,
      buttons: [
        {
          text: dictionary.Cancel,
          role: "cancel",
          cssClass: "info-alert-btn",
        },
        {
          text: dictionary.UnAssign,
          role: "confirm",
          cssClass: "danger-alert-btn",
          handler: () => {
            this.unAssignSaleManager();
          },
        },
      ],
    });

    await alert.present();
  }
  unAssignSaleManager(): void {
    this.loadingService.present();
    this.saleManagerService
      .unAssignMerchant(
        this.branchId,
        this.merchant?.saleManager?.saleManagerId!,
        this.customerService.branch?.merchantId!
      )
      .subscribe({
        next: (res) => {
          this.getMerchant();
          this.notificationService.showSuccessNotification(
            `${this.customerService.branch?.merchantName} unassigned.`
          );
        },
        error: (err) => {
          this.loadingService.dismiss();
          throw Error(err.message);
        },
        complete: () => {
          this.loadingService.dismiss();
        },
      });
  }
  ngOnDestroy(): void {
    this.initBranch$.unsubscribe();
    this.editCustomerSub$.unsubscribe();
  }
}
