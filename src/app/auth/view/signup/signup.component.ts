import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { FirebaseAuthService } from "@app/auth/service/firebase-auth.service";
import { NotificationService } from "@app/core/services";
import { dictionary } from "@dictionary/dictionary";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"],
})
export class SignupComponent {
  dictionary = dictionary;
  email: string | undefined;
  password: string | undefined;
  passError: string | undefined;
  confirmPassword: string | undefined;
  passMatch = false;

  constructor(
    private firebaseAuthService: FirebaseAuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  passwordCheck() {
    if (
      this.password &&
      this.confirmPassword &&
      this.password === this.confirmPassword
    ) {
      const containsLetter = /[a-zA-Z]/.test(this.password);
      const containsNumber = /\d/.test(this.password);
      const isValidLength = this.password.length >= 6;

      if (isValidLength && containsLetter && containsNumber) {
        this.passError = "";
        this.passMatch = true;
      } else {
        this.passMatch = false;
        this.passError = `Password must be at least ${isValidLength} characters long and contain both letters and numbers`;
      }
    } else {
      if (!this.password || !this.confirmPassword) {
        this.passError = "Please enter both password and confirm password";
        this.passMatch = false;
      } else {
        this.passError = "Passwords does not match";
        this.passMatch = false;
      }
    }
  }

  resetForm() {
    this.email = "";
    this.password = "";
    this.confirmPassword = "";
  }

  async onSignUp() {
    if (!this.email || !this.password || !this.confirmPassword) return;
    try {
      this.firebaseAuthService.changeSigninWithGoogleLoading(true);
      const userCredential =
        await this.firebaseAuthService.signupEmailAndPassword(
          this.email,
          this.password
        );
      this.notificationService.showSuccessNotification(
        `User "${userCredential.user.email}" has been registred`
      );
      this.firebaseAuthService.changeSigninWithGoogleLoading(false);
      this.router.navigate(["/auth/signin"]);
    } catch (error) {
      this.firebaseAuthService.changeSigninWithGoogleLoading(false);
      this.notificationService.showErrorAlertNotification(`${error}`);
    }
  }

  signinWithGoogle(): void {
    this.firebaseAuthService.callSigninWithGoogle();
  }
}
