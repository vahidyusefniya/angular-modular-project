import { Component, EventEmitter, Input, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-pin-modal",
  templateUrl: "./pin-modal.component.html",
  styleUrls: ["./pin-modal.component.scss"],
})
export class PinModalComponent {
  dictionary = dictionary;
  pin: string | undefined;

  @Input() isOpen = false;
  @Input() title: string | undefined;

  @Output() dismiss = new EventEmitter();
  @Output() updatePin = new EventEmitter<string>();

  constructor(private modalCtrl: ModalController) {}

  keyup(event: any): void {
    const input = event.target as HTMLInputElement;
    let sanitizedValue = input.value.replace(/[^0-9]/g, "");
    input.value = sanitizedValue;
    this.pin = input.value;
    event.preventDefault();
  }

  onUpdatePinClick(): void {
    this.updatePin.emit(this.pin);
    this.modalCtrl.dismiss();
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
