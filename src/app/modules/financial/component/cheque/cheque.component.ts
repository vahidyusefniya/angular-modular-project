// noinspection JSIgnoredPromiseFromCall

import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { NotificationService } from "@app/core/services";
import { dictionary } from "@dictionary/dictionary";
import { environment } from "@environments/environment";
import { MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";

@Component({
  selector: "app-cheque",
  templateUrl: "./cheque.component.html",
  styleUrls: ["./cheque.component.scss"],
})
export class ChequeComponent {
  dictionary = dictionary;
  amount: number | undefined;
  uploadedFiles: any[] = [];
  uploadImageUrl = `${environment.Base__Url}/api/v1/system/upload-image`;
  imageUrl: string | undefined;

  @Input() isOpen = false;
  @ViewChild("form") form: any;
  @Output() dismiss = new EventEmitter();
  @Output() submit = new EventEmitter();
  readonly thousandSeparator: MaskitoOptions = maskitoNumberOptionsGenerator({
    thousandSeparator: ",",
  });

  constructor(private notificationService: NotificationService) {}
  resetForm(): void {
    this.amount = undefined;
  }

  onUpload(event: any) {
    this.uploadedFiles = [];
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.imageUrl = event.originalEvent.body;
    this.imageUrl = event.originalEvent.body;
    this.notificationService.showSuccessNotification(
      "upload image successfully",
    );
  }

  submitForm(): void {
    if (!this.form.form.valid) {
      return;
    }
    this.submit.emit();
    this.resetForm();
  }

  onDismiss(): void {
    this.resetForm();
    this.dismiss.emit();
  }
}
