import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { PhysicalCardOrder, PhysicalCardOrderState, PosOrder } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-change-state-modal",
  templateUrl: "./change-state-modal.component.html",
  styleUrls: ["./change-state-modal.component.scss"],
})
export class ChangeStateModalComponent implements OnInit {
  dictionary = dictionary;
  description: string | undefined;
  physicalCardOrderState = PhysicalCardOrderState
  @Input() isOpen = false;
  @Input() physicalCardOrder: PhysicalCardOrder | undefined;

  @Output() dismiss = new EventEmitter();
  @Output() changeState = new EventEmitter();

  constructor(private modalCtrl: ModalController) {}

  ngOnInit(): void {}
  onDismiss(): void {
    this.dismiss.emit();
    this.modalCtrl.dismiss();
  }

  onConfirmClick(): void {
    this.changeState.emit(this.description);
    this.onDismiss();
  }
}
