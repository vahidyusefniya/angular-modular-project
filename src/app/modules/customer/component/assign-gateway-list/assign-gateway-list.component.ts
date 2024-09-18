// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { GatewayList } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-assign-gateway-list",
  templateUrl: "./assign-gateway-list.component.html",
  styleUrls: ["./assign-gateway-list.component.scss"],
})
export class AssignGatewayListComponent implements OnInit {
  dictionary = dictionary;
  gatewayListId: number | undefined;

  @Input() selectedGatewayListId: number | undefined;
  @Input() gatewayList: GatewayList[] = [];
  @Input() isOpen = false;
  @Input() title: string | undefined;

  @Output() assignGatewayList = new EventEmitter<GatewayList>();
  @Output() dismiss = new EventEmitter();

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.selectedGatewayListId) {
      this.gatewayListId = this.selectedGatewayListId;
    }
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onAssignGatewayClick(): void {
    const gateWay = this.gatewayList.find(
      (g) => g.gatewayListId == this.gatewayListId
    );
    this.assignGatewayList.emit(gateWay);
    this.modalCtrl.dismiss();
  }
}
