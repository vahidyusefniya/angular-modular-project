// noinspection JSIgnoredPromiseFromCall

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { IonModal } from "@ionic/angular";
import * as jsbarcode from "jsbarcode";

@Component({
  selector: "app-product-barcode-modal",
  templateUrl: "./product-barcode-modal.component.html",
  styleUrls: ["./product-barcode-modal.component.scss"],
})
export class ProductBarcodeModalComponent implements OnInit {
  dictionary = dictionary;

  @Input() isOpen = false;
  @Input() productName: string | undefined;
  @Input() price: number | undefined;

  @Output() dismiss = new EventEmitter();

  @ViewChild("productBarcodeModal") productBarcodeModal!: IonModal;

  ngOnInit(): void {
    setTimeout(() => {
      jsbarcode("#barcode", "69554841884859", {
        font: "MyriadPro",
        fontSize: 15,
      });
    }, 50);
  }
  onDismiss(): void {
    this.productBarcodeModal.dismiss();
    this.isOpen = false;
    this.dismiss.emit();
  }
}
