// noinspection JSIgnoredPromiseFromCall,JSUnusedGlobalSymbols

import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { CoreService } from "@app/core/services";
import { LayoutService } from "@app/layout";

@Injectable({
  providedIn: "root",
})
export class MobileGuard {
  branchId: number;

  constructor(
    private layoutService: LayoutService,
    private router: Router,
    private coreService: CoreService,
  ) {
    this.branchId = this.coreService.getBranchId()!;
  }
  canActivate(): boolean {
    if (this.layoutService.getDeviceMode() === "mobile") return true;

    this.router.navigate([`/branches/${this.branchId}/shop`]);
    return false;
  }
}
