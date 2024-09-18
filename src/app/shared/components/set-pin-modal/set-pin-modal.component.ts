import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-set-pin-modal",
  templateUrl: "./set-pin-modal.component.html",
  styleUrls: ["./set-pin-modal.component.scss"],
})
export class SetPinModalComponent {
  dictionary = dictionary;
  pin: string | undefined;
  title = "Enter pin code";

  @Input() isOpen = false;

  @Output() dismiss = new EventEmitter();
  @Output() setPin = new EventEmitter<string>();

  constructor(private modalCtrl: ModalController) {}

  keyup(event: any): void {
    const input = event.target as HTMLInputElement;
    let sanitizedValue = input.value.replace(/[^0-9]/g, "");
    input.value = sanitizedValue;
    this.pin = input.value;
    event.preventDefault();
  }

  onUpdatePinClick(): void {
    this.setPin.emit(this.pin);
    this.modalCtrl.dismiss();
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
