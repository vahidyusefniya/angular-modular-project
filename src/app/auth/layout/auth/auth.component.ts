import { Component } from "@angular/core";
import { UserCredential } from "@angular/fire/auth";
import { NavigationEnd, Router } from "@angular/router";
import { FirebaseAuthService } from "@app/auth/service/firebase-auth.service";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { NotificationService, StorageService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  ApiKey,
  AuthenticationClient,
  Branch,
  RefreshTokenType,
  SignInRequest,
  TeamClient,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { Platform } from "@ionic/angular";
import { filter } from "rxjs";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.component.html",
  styleUrls: ["./auth.component.scss"],
})
export class AuthComponent {
  signInRequest = new SignInRequest();
  openChooseBranchModal = false;
  showConfirm: boolean = false;
  branches: Branch[] = [];
  loading = false;
  dictionary = dictionary;
  opwnAuthErrorModal = false;

  constructor(
    private router: Router,
    private authenticationClient: AuthenticationClient,
    private storageService: StorageService,
    private layoutService: LayoutService,
    private teamClient: TeamClient,
    private firebaseAuthService: FirebaseAuthService,
    private notificationService: NotificationService,
    private platform: Platform
  ) {
    this.firebaseAuthService.signinWithGoogle.subscribe(() => {
      this.signinWithGoogle();
    });
    this.firebaseAuthService.signinWithGoogleLoading.subscribe((loading) => {
      this.loading = loading;
    });
    this.firebaseAuthService.signinToApp.subscribe((data) => {
      this.signinToApp(data);
    });
    this.firebaseAuthService.currentUser.subscribe((user) => {
      if (user) this.signinToApp(user);
      else this.loading = false;
    });
  }

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if ((event as NavigationEnd).url === "/auth/confirm") {
          this.showConfirm = true;
        } else {
          this.showConfirm = false;
        }
      });
  }

  async signinWithGoogle() {
    this.loading = true;
    try {
      if (this.platform.is("hybrid")) {
        this.signIn(
          await this.firebaseAuthService.onGoogleSignInWithCredential()
        );
      } else {
        this.signIn(await this.firebaseAuthService.signInWithPopup());
      }
    } catch (error) {
      this.loading = false;
      const errorMSG = JSON.stringify(error);
      if (errorMSG.includes("popup_blocked_by_browser")) {
        this.opwnAuthErrorModal = true;
      } else if (errorMSG.includes("network")) {
        this.notificationService.showErrorAlertNotification("Network error.");
      } else {
        this.notificationService.showErrorAlertNotification(`${errorMSG}`);
      }
    }
  }

  async signIn(user: UserCredential) {
    try {
      const idToken: string = await user.user.getIdToken();
      this.signInRequest.init({
        idToken: idToken,
        refreshTokenType: RefreshTokenType.None,
      });
      this.signinToApp(this.signInRequest);
    } catch (error) {
      this.loading = false;
      const errorMSG = JSON.stringify(error);
      this.notificationService.showErrorAlertNotification(`${errorMSG}`);
    }
  }

  signinToApp(signInRequest: SignInRequest): void {
    const me = this;
    this.authenticationClient.signIn(signInRequest).subscribe({
      next(res: ApiKey) {
        me.storageService.set("token", res.accessToken.value);
        me.initMyBranch();
      },
      error(err) {
        me.loading = false;
        throw Error(err.message);
      },
    });
  }
  initMyBranch(): void {
    this.teamClient.getMerchantsBranch().subscribe({
      next: (res: Branch[]) => {
        this.loading = false;
        this.firebaseAuthService.changeSigninWithGoogleLoading(false);
        this.branches = res;
        if (res.length == 1) {
          this.layoutService.setSelectedBranch(res[0]);
          this.layoutService.setDeviceMode("desktop");
          this.moveToApp(res[0], "RouteByAPI");
        } else {
          this.openChooseBranchModal = true;
          this.layoutService.updateBranches(res);
        }
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        throw Error(error.message);
      },
    });
  }
  branchSelectionChange(data: Branch): void {
    this.loading = false;
    this.layoutService.setSelectedBranch(data);
    this.moveToApp(data, "RouteBySelectedBranch");
  }
  moveToApp(
    branch: Branch,
    type: "RouteBySelectedBranch" | "RouteByAPI"
  ): void {
    setTimeout(
      () => {
        const device = this.layoutService.getDeviceMode();
        if (device === "desktop" || !device) {
          if (branch.canPlaceOrder) {
            this.router.navigate([`/branches/${branch.branchId}/shop`]);
          } else
            this.router.navigate([`/branches/${branch.branchId}/price-lists`]);
        } else {
          if (branch.canPlaceOrder) {
            this.router.navigate([`/branches/${branch.branchId}/eGift`]);
          } else this.router.navigate([`/branches/${branch.branchId}/orders`]);
        }
      },
      type === "RouteByAPI" ? 200 : 0
    );
  }
}
