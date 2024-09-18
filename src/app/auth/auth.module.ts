import { NgModule } from "@angular/core";
import { getAuth, provideAuth } from "@angular/fire/auth";
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { CoreModule } from "@app/core/core.module";
import { SharedModule } from "@app/shared/shared.module";
import { environment } from "@environments/environment";
import { SigninWithGoogleButtonComponent } from "./component/signin-with-google-button/signin-with-google-button.component";
import { AuthGuard } from "./guard/auth.guard";
import { AuthComponent } from "./layout/auth/auth.component";
import { FirebaseAuthService } from "./service/firebase-auth.service";
import { ForgetPasswordComponent } from "./view/forget-password/forget-password.component";
import { SigninComponent } from "./view/signin/signin.component";
import { SignupComponent } from "./view/signup/signup.component";
import { AuthErrorModalComponent } from "./component/auth-error-modal/auth-error-modal.component";
import { ConfirmForgetPassComponent } from "./view/confirm-forget-pass/confirm-forget-pass.component";

@NgModule({
  declarations: [
    ForgetPasswordComponent,
    SigninComponent,
    SignupComponent,
    ConfirmForgetPassComponent,
    AuthComponent,
    SigninWithGoogleButtonComponent,
    AuthErrorModalComponent,
  ],
  imports: [
    SharedModule,
    CoreModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    provideAuth(() => getAuth()),
  ],
  providers: [FirebaseAuthService, AuthGuard],
})
export class AuthModule {}
