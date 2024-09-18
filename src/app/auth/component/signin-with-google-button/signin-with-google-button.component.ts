import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";

@Component({
  selector: "app-signin-with-google-button",
  templateUrl: "./signin-with-google-button.component.html",
  styleUrls: ["./signin-with-google-button.component.scss"],
})
export class SigninWithGoogleButtonComponent {
  dictionary = dictionary;

  @Output() signinWithGoogle = new EventEmitter();

  onSigninWithGoogleClick(): void {
    this.signinWithGoogle.emit();
  }
}
