import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { FirebaseAuthService } from "@app/auth/service/firebase-auth.service";
import { NotificationService } from "@app/core/services";
import { dictionary } from "@dictionary/dictionary";

@Component({
  selector: "app-forget-password",
  templateUrl: "./forget-password.component.html",
  styleUrls: ["./forget-password.component.scss"],
})
export class ForgetPasswordComponent {
  dictionary = dictionary;
  email: string | undefined;

  constructor(
    private firebaseAuthService: FirebaseAuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  signinWithGoogle(): void {
    this.firebaseAuthService.callSigninWithGoogle();
  }

  async onForgetPass() {
    if (!this.email) return;
    try {
      this.firebaseAuthService.changeSigninWithGoogleLoading(true);
      await this.firebaseAuthService.sendPasswordResetEmail(this.email);
      // this.notificationService.showSuccessNotification(
      //   `A password reset email has been sent to "${this.email}". Follow the instructions in the email to create a new password`
      // );
      this.firebaseAuthService.changeSigninWithGoogleLoading(false);
      this.router.navigate(["/auth/confirm"]);
    } catch (error) {
      this.firebaseAuthService.changeSigninWithGoogleLoading(false);
      this.notificationService.showErrorAlertNotification(`${error}`);
    }
  }
}
