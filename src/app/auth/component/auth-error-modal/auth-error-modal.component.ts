import { Component, Input } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";

@Component({
  selector: "app-auth-error-modal",
  templateUrl: "./auth-error-modal.component.html",
  styleUrls: ["./auth-error-modal.component.scss"],
})
export class AuthErrorModalComponent {
  dictionary = dictionary;

  @Input() isOpen = false;

  onDismiss(): void {
    location.reload();
  }
}
