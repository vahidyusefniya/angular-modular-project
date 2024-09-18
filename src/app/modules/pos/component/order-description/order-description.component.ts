import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-order-description",
  templateUrl: "./order-description.component.html",
  styleUrls: ["./order-description.component.scss"],
})
export class OrderDescriptionComponent implements OnInit {
  dictionary = dictionary;

  @Input() isOpen = false;
  @Input() description: string | null | undefined = "";

  @Output() dismiss = new EventEmitter();

  constructor(private modalController: ModalController) {}

  ngOnInit(): void {
  }

  onDismiss(): void {
    this.modalController.dismiss();
    this.dismiss.emit();
  }
}
