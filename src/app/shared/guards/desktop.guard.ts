// noinspection JSIgnoredPromiseFromCall

import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { CoreService } from "@app/core/services";
import { LayoutService } from "@app/layout";

@Injectable({
  providedIn: "root",
})
export class DesktopGuard {
  branchId: number;

  constructor(
    private layoutService: LayoutService,
    private router: Router,
    private coreService: CoreService,
  ) {
    this.branchId = this.coreService.getBranchId()!;
  }

  // noinspection JSUnusedGlobalSymbols
  canActivate(): boolean {
    if (this.layoutService.getDeviceMode() === "desktop") {
      return true;
    }

    this.router.navigate([`/branches/${this.branchId}/eGift`]);
    return false;
  }
}
