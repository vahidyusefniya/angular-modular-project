// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { IMultiSelectModalData } from "@app/shared/components";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-edit-gateway",
  templateUrl: "./edit-gateway.component.html",
  styleUrls: ["./edit-gateway.component.scss"],
})
export class EditGatewayComponent implements OnInit {
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
  @Input() title: string | undefined;

  @Output() editGatewayClick = new EventEmitter<any>();
  @Output() dismiss = new EventEmitter();

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onNewGatewayClick(): void {
    this.modalCtrl.dismiss();
    this.editGatewayClick.emit();
  }

  confirmMultiSelectProvidersModal(data: IMultiSelectModalData): void {
    this.providersInputValue = data.text;
  }
}
