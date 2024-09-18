// noinspection JSIgnoredPromiseFromCall

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FirebaseAuthService } from "@app/auth";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService, StorageService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  Branch,
  BranchesClient,
  SignInRequest,
  TeamClient,
} from "@app/proxy/proxy";
import { Network } from "@capacitor/network";
import { dictionary } from "@dictionary/dictionary";
import { MenuController } from "@ionic/angular";
import { lastValueFrom } from "rxjs";

@Component({
  selector: "app-application",
  templateUrl: "./application.component.html",
  styleUrls: ["./application.component.scss"],
})
export class ApplicationComponent implements OnInit {
  appMode: "mobile" | "desktop" | undefined = undefined;
  showApp = false;
  dictionary = dictionary;
  branchId: number | undefined;
  openChooseBranchModal = false;
  branches: Branch[] = [];
  selectedBranch: Branch | undefined;
  signInRequest = new SignInRequest();
  networkAlertButtons = [
    {
      text: "Try again",
      handler: () => {
        location.reload();
      },
    },
  ];
  isNetworkConnected = true;

  constructor(
    private router: Router,
    private layoutService: LayoutService,
    private branchesClient: BranchesClient,
    private coreService: CoreService,
    private storageService: StorageService,
    private teamClient: TeamClient,
    private menuController: MenuController,
    private firebaseAuthService: FirebaseAuthService
  ) {}

  async ngOnInit() {
    Network.addListener("networkStatusChange", (status) => {
      if (!status.connected) this.isNetworkConnected = status.connected;
    });
    const status = await Network.getStatus();
    this.isNetworkConnected = status.connected;
    this.appMode = this.layoutService.getDeviceMode();
    if (this.isNetworkConnected) this.initMyBranch();
    else {
      this.showApp = false;
    }
  }

  initMyBranch(): void {
    this.branches = this.layoutService.branches;
    if (this.branches.length == 0) {
      this.teamClient.getMerchantsBranch().subscribe({
        next: (res: Branch[]) => {
          this.branches = res;
          this.layoutService.updateBranches(res);
          this.moveToAppModule();
          this.firebaseAuthService.backgroundRefreshToken();
        },
        error: (error: ResponseErrorDto) => {
          this.showApp = true;
          throw Error(error.message);
        },
      });
    } else {
      this.layoutService.updateBranches(this.branches);
      this.moveToAppModule();
      this.firebaseAuthService.backgroundRefreshToken();
    }
  }

  branchSelectionChange(data: Branch): void {
    this.branchId = data.branchId;
    this.menuController.close();
    this.moveToAppModule();
  }

  async moveToAppModule(): Promise<void> {
    this.branchId = this.coreService.getBranchId();
    const branch = this.getBranch(this.branchId!);
    this.layoutService.updateBranch(branch);
    const branchIdInLocalStorage = this.getBranchIdFromStorage();
    const validBranchIdInLocalStorage = this.checkValidBranch(
      branchIdInLocalStorage
    );
    if (!this.branchId) {
      if (validBranchIdInLocalStorage) {
        this.branchId = branchIdInLocalStorage;
        this.selectedBranch = this.getBranch(this.branchId!);
        this.layoutService.updateBranch(this.selectedBranch);
        this.setDefaultBranch(this.branchId!);
        this.initPermissions(String(this.branchId));
      } else {
        if (this.branches.length == 1) {
          this.branchId = this.branches[0].branchId;
          this.layoutService.updateBranch(this.selectedBranch!);
          this.setDefaultBranch(this.branchId);
          this.initPermissions(String(this.branchId));
        } else {
          this.openChooseBranchModal = true;
          this.showApp = false;
        }
      }
    } else {
      if (this.checkValidBranch(this.branchId!)) {
        this.selectedBranch = this.getBranch(this.branchId);
        this.setDefaultBranch(this.branchId);
        this.layoutService.updateBranch(this.selectedBranch);
        this.initPermissions(String(this.branchId));
      } else {
        const branch: Branch | undefined = await lastValueFrom(
          this.branchesClient.get(this.branchId)
        );
        if (branch) {
          this.setDefaultBranch(branch.branchId);
          this.layoutService.updateBranch(branch);
          this.initPermissions(String(branch.branchId));
        } else {
          this.router.navigate(["/forbidden"]);
          this.showApp = true;
        }
      }
    }
  }
  setDefaultBranch(id: number): void {
    this.storageService.set("defaultBranch", id);
  }
  async initPermissions(resourceId: string) {
    try {
      const permissions = await lastValueFrom(
        this.teamClient.listCurrentUserPermissions(resourceId)
      );
      const offices = await lastValueFrom(
        this.branchesClient.getSubBranches(this.branchId!)
      );
      this.layoutService.setOffices(offices);
      this.layoutService.setPermissions(permissions);
      this.showAndReturnToApp();
    } catch (error) {
      this.showApp = true;
      throw Error(JSON.stringify(error));
    }
  }
  showAndReturnToApp(): void {
    const url = this.router.url;
    if (
      url &&
      url !== "/" &&
      !url.includes("undefined") &&
      !url.includes("NaN") &&
      !url.includes("forbidden")
    ) {
      this.showApp = true;
    } else {
      this.showApp = true;
      const device = this.layoutService.getDeviceMode();
      const branch = this.layoutService.branch;
      if (device === "desktop" || !device) {
        if (branch?.canPlaceOrder) {
          this.router.navigate([`/branches/${branch.branchId}/shop`]);
        } else
          this.router.navigate([`/branches/${branch?.branchId}/price-lists`]);
      } else {
        if (branch?.canPlaceOrder) {
          this.router.navigate([`/branches/${branch.branchId}/eGift`]);
        } else this.router.navigate([`/branches/${branch?.branchId}/orders`]);
      }
    }
  }
  getBranchIdFromStorage(): number | undefined {
    const branchStorage = this.storageService.get("defaultBranch");
    return Number(branchStorage);
  }
  checkValidBranch(branchId: number | undefined): boolean {
    const branch = this.branches.find((b) => b.branchId == branchId);
    return !!branch;
  }
  getBranch(branchId: number): Branch {
    const branch = this.branches.find((b) => b.branchId == branchId);
    return branch!;
  }
}
