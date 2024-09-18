import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-two-fa-exception",
  templateUrl: "./two-fa-exception.component.html",
  styleUrls: ["./two-fa-exception.component.scss"],
})
export class TwoFaExceptionComponent {
  dictionary = dictionary;
  code: string | undefined;

  @Input() isOpen = false;

  @Output() submit = new EventEmitter<string>();
  @Output() dismiss = new EventEmitter();

  constructor(private modalCtrl: ModalController) {}

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onSubmitClick(): void {
    this.submit.emit(this.code);
    this.onDismiss();
  }
}
