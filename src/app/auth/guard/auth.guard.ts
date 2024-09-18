import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { LayoutService } from "../../layout";
import { StorageService } from "@app/core/services";
import { FirebaseAuthService } from "../service/firebase-auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard {
  token: string | undefined;

  constructor(
    private storageService: StorageService,
    private router: Router,
    private layoutService: LayoutService,
    private AirebaseAuthService: FirebaseAuthService
  ) {}

  async canActivate() {
    this.token = this.storageService.get("token");
    if (!this.validToken(this.token)) {
      this.storageService.clear();
      this.router.navigate(["/auth/signin"]);
      return false;
    }
    return true;
  }

  validToken(token: string | undefined): boolean {
    if (!token) return false;
    if (this.AirebaseAuthService.hasExpireTime()) return false;
    let base64Url = token.split(".")[1];
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    let jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return jsonPayload != null || jsonPayload != undefined ? true : false;
  }
}
