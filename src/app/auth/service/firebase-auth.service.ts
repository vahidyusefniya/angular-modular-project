import { Injectable } from "@angular/core";
import {
  OAuthProvider,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "@angular/fire/auth";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { LoadingService, StorageService } from "@app/core/services";
import {
  ApiKey,
  AuthenticationClient,
  RefreshTokenType,
  SignInRequest,
} from "@app/proxy/proxy";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { dictionary } from "@dictionary/dictionary";
import { AlertController } from "@ionic/angular";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
  signOut,
} from "firebase/auth";
import { Subject, firstValueFrom, lastValueFrom } from "rxjs";
import { IToken } from "../model/auth.model";
import { environment } from "@environments/environment";

@Injectable({
  providedIn: "root",
})
export class FirebaseAuthService {
  currentUser = new Subject<any>();
  isLoading = false;
  signinWithGoogle = new Subject<void>();
  signinWithGoogleLoading = new Subject<boolean>();
  signinToApp = new Subject<SignInRequest>();
  backgroundRefreshTokenInterval: any;

  private initializedGoogleAuth = false;
  private signInRequest = new SignInRequest();

  constructor(
    private angularFireAuth: AngularFireAuth,
    private storage: StorageService,
    private authenticationClient: AuthenticationClient,
    private loadingService: LoadingService,
    private alert: AlertController
  ) {}

  async onGoogleSignInWithCredential(): Promise<UserCredential> {
    if (!this.initializedGoogleAuth) await GoogleAuth.initialize();
    this.initializedGoogleAuth = true;
    const googleUser = (await GoogleAuth.signIn()) as any;
    const credential = GoogleAuthProvider.credential(
      googleUser.authentication.idToken
    );
    const auth = getAuth();
    return await signInWithCredential(auth, credential);
  }
  async signInWithRedirect(): Promise<void> {
    const provider = new OAuthProvider(GoogleAuthProvider.PROVIDER_ID);
    const scopes = environment.Scopes;

    scopes.forEach((scope) => {
      provider.addScope(scope);
    });

    return await this.angularFireAuth.signInWithRedirect(provider);
  }
  async signInWithPopup(): Promise<any> {
    const provider = new OAuthProvider(GoogleAuthProvider.PROVIDER_ID);
    const scopes = environment.Scopes;

    scopes.forEach((scope) => {
      provider.addScope(scope);
    });

    return await this.angularFireAuth.signInWithPopup(provider);
  }

  async signupEmailAndPassword(email: string, password: string) {
    const auth = getAuth();
    return await createUserWithEmailAndPassword(auth, email, password);
  }
  async signInWithEmailAndPassword(email: string, password: string) {
    const auth = getAuth();
    return await signInWithEmailAndPassword(auth, email, password);
  }
  async sendPasswordResetEmail(email: string) {
    return await this.angularFireAuth.sendPasswordResetEmail(email);
  }

  async signout() {
    const auth = getAuth();
    await signOut(auth);
    this.storage.clear();
    location.href = `${location.origin}/auth/signin`;
  }

  callSigninWithGoogle(): void {
    this.signinWithGoogle.next();
  }
  changeSigninWithGoogleLoading(loading: boolean): void {
    this.signinWithGoogleLoading.next(loading);
  }
  callSigninToApp(signInRequest: SignInRequest): void {
    this.signinToApp.next(signInRequest);
  }

  backgroundRefreshToken() {
    const token = this.storage.get("token");
    const exp = this.parseJwt(token).exp;
    const nowTime = Math.round(new Date().getTime() / 1000);
    const jobTime = exp - nowTime - 30;

    this.backgroundRefreshTokenInterval = setInterval(async () => {
      const token = await this.getRefreshToken();
      try {
        this.signInRequest.init({
          idToken: token,
          refreshTokenType: RefreshTokenType.None,
        });
        const signin: ApiKey = await lastValueFrom(
          this.authenticationClient.signIn(this.signInRequest)
        );
        const refreshToken = signin.accessToken.value;
        this.storage.set("token", refreshToken);
      } catch (error) {
        clearInterval(this.backgroundRefreshTokenInterval);
        this.reconnectErrorAlert();
      }
    }, jobTime * 1000);
  }
  parseJwt(token: string): IToken {
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

    return JSON.parse(jsonPayload);
  }
  hasExpireTime(): boolean {
    const token = this.storage.get("token");
    const exp = this.parseJwt(token).exp;
    const nowTime = new Date().getTime() / 1000;
    if (exp <= nowTime) return true;
    else return false;
  }
  async reconnect() {
    this.loadingService.present();
    const token = await this.getRefreshToken();
    this.signInRequest.init({
      idToken: token,
      refreshTokenType: RefreshTokenType.None,
    });
    try {
      const signin: ApiKey = await lastValueFrom(
        this.authenticationClient.signIn(this.signInRequest)
      );
      const refreshToken = signin.accessToken.value;
      this.storage.set("token", refreshToken);
      this.loadingService.dismiss();
      this.backgroundRefreshToken();
    } catch (error) {
      this.reconnectErrorAlert();
    }
  }
  async reconnectErrorAlert() {
    const me = this;
    const alert = await this.alert.create({
      header: "Error",
      backdropDismiss: false,
      message: "Something went wrong. Click refresh try again",
      buttons: [
        {
          text: "reconnect",
          handler() {
            me.reconnect();
          },
        },
      ],
    });

    await alert.present();
  }
  async getRefreshToken(): Promise<string> {
    const toekn = await firstValueFrom(this.angularFireAuth.idToken);
    if (!toekn) {
      this.signout();
      return dictionary.Empty;
    }
    return toekn;
  }
}
