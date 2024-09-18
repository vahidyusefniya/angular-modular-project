import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { dictionary } from "@dictionary/dictionary";
import { environment } from "@environments/environment";
import { ModalController } from "@ionic/angular";
import { MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";

@Component({
  selector: "app-confirmation-upload-new-item",
  templateUrl: "./confirmation-upload-new-item.component.html",
  styleUrls: ["./confirmation-upload-new-item.component.scss"],
})
export class ConfirmationUploadNewItemComponent implements OnInit {
  dictionary = dictionary;
  confirmationUnitPrice: number | undefined;
  tempUnitPrice: number | undefined;

  @Input() isOpen = false;
  @Input() unitPrice: number | undefined;
  @Input() productName: string | undefined;
  @Input() currencyName: string | undefined;
  @Input() codeList: any[] = [];
  @Output() dismiss = new EventEmitter();

  @Output() onCreateProductItemOrderClick = new EventEmitter();

  readonly thousandSeparator: MaskitoOptions = maskitoNumberOptionsGenerator({
    thousandSeparator: ",",
    precision: environment.precision,
  });

  constructor(
    private modalCtrl: ModalController,
    private coreService: CoreService
  ) {}

  ngOnInit() {
    if (typeof this.unitPrice === "number") {
      this.tempUnitPrice = this.unitPrice;
    } else {
      this.tempUnitPrice = Number((this.unitPrice as any).replace(/,/g, ""));
    }
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onSaveClick(): void {
    this.onCreateProductItemOrderClick.emit();
    this.modalCtrl.dismiss();
  }
  isValidAmount(): boolean {
    if (this.confirmationUnitPrice) {
      if (
        Number((this.confirmationUnitPrice as any).replace(/,/g, "")) ===
        this.tempUnitPrice
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }
}
