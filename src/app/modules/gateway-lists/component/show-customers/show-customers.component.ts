import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MerchantSummary } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-show-customers",
  templateUrl: "./show-customers.component.html",
  styleUrls: ["./show-customers.component.scss"],
})
export class ShowCustomersComponent implements OnInit {
  dictionary = dictionary;
  @Input() customers: MerchantSummary[] = [];
  @Input() isOpen = false;
  @Input() gateWayListName: string | undefined;

  @Output() dismiss = new EventEmitter();

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
