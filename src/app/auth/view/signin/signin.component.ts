import { Component, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { FirebaseAuthService } from "@app/auth/service/firebase-auth.service";
import { NotificationService } from "@app/core/services";
import { RefreshTokenType, SignInRequest } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { IonInput, Platform } from "@ionic/angular";

@Component({
  selector: "app-signin",
  templateUrl: "./signin.component.html",
  styleUrls: ["./signin.component.scss"],
})
export class SigninComponent {
  dictionary = dictionary;
  email: string | undefined;
  password: string | undefined;
  passError: string | undefined;
  showPassword = false;
  isNativeIos = false;

  @ViewChild("signInForm") signInForm!: NgForm;
  @ViewChild("emailInput") emailInput!: IonInput;

  constructor(
    private firebaseAuthService: FirebaseAuthService,
    private notificationService: NotificationService,
    private platform: Platform
  ) {
    if (this.platform.is("hybrid") && this.platform.is("ios")) {
      this.isNativeIos = true;
    }
  }

  async onSignIn() {
    if (!this.email || !this.password) return;
    try {
      this.firebaseAuthService.changeSigninWithGoogleLoading(true);
      const userCredential =
        await this.firebaseAuthService.signInWithEmailAndPassword(
          this.email,
          this.password
        );
      const token = await userCredential.user.getIdToken();
      const signInRequest = new SignInRequest();
      signInRequest.init({
        idToken: token,
        refreshTokenType: RefreshTokenType.None,
      });
      this.firebaseAuthService.callSigninToApp(signInRequest);
      this.notificationService.notificationDismiss();
    } catch (error) {
      this.firebaseAuthService.changeSigninWithGoogleLoading(false);
      const errorMSG = JSON.stringify(error);
      console.log(errorMSG);
      if (errorMSG.includes("auth/invalid-credential")) {
        this.notificationService.showErrorAlertNotification(
          dictionary.WrongPassword
        );
      } else {
        this.notificationService.showErrorAlertNotification(`${errorMSG}`);
      }
    }
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  signinWithGoogle(): void {
    this.firebaseAuthService.callSigninWithGoogle();
    this.signInForm.reset();
  }
}
