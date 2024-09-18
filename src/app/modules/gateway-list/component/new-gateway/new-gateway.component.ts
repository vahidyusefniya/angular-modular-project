// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IMultiSelectModalData } from "@app/shared/components";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-new-gateway",
  templateUrl: "./new-gateway.component.html",
  styleUrls: ["./new-gateway.component.scss"],
})
export class NewGatewayComponent {
  dictionary = dictionary;
  openMultiSelectProvidersModal = false;
  isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  providersList = [
    {
      id: 1,
      provider: "Amazon",
      icon: `Amazon${this.isDark ? "-dark" : ""}`,
    },
    { id: 2, provider: "Paypal", icon: `PayPal${this.isDark ? "-dark" : ""}` },
  ];
  providersInputValue: string | undefined;

  @Input() isOpen = false;

  @Output() newGatewayClick = new EventEmitter<any>();
  @Output() dismiss = new EventEmitter();

  constructor(private modalCtrl: ModalController) {}

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onNewGatewayClick(): void {
    this.modalCtrl.dismiss();
    this.newGatewayClick.emit();
  }

  confirmMultiSelectProvidersModal(data: IMultiSelectModalData): void {
    this.providersInputValue = data.text;
  }
}
