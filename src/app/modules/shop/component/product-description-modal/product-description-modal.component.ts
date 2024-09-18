import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { IDescirption } from "../../dto/shop.dto";

@Component({
  selector: "app-product-desktop-description-modal",
  templateUrl: "./product-description-modal.component.html",
  styleUrls: ["./product-description-modal.component.scss"],
})
export class ProductDescriptionModalComponent implements OnInit {
  dictionary = dictionary;
  descriptions: IDescirption[] = [];

  @Input() isOpen = false;
  @Input() description: string | null | undefined = "";

  @Output() dismiss = new EventEmitter();

  constructor(private modalController: ModalController) {}

  ngOnInit(): void {
    setTimeout(() => {
      if (this.description) {
        if (this.description.startsWith("<p>")) {
          const descriptionHtml = document.getElementById("description");
          this.descriptions = JSON.parse(descriptionHtml!.innerText).content;
        } else this.descriptions = JSON.parse(this.description).content;
      }
    }, 100);
  }

  onDismiss(): void {
    // noinspection JSIgnoredPromiseFromCall
    this.modalController.dismiss();
    this.dismiss.emit();
  }
}
