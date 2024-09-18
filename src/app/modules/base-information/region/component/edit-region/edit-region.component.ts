import { Component, Input, Output, EventEmitter } from "@angular/core";
import { NotificationService } from "@app/core/services";
import { Region, UpdateRegionRequest } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { environment } from "@environments/environment";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-edit-region",
  templateUrl: "./edit-region.component.html",
  styleUrls: ["./edit-region.component.scss"],
})
export class EditRegionComponent {
  dictionary = dictionary;
  loading = false;
  uploadImageUrl = `${environment.Base__Url}/api/v1/system/upload-image`;
  localImageSRC = "../../../../../assets/img/placeholder.jpg";
  uploadedFiles: any[] = [];
  imageUrl: string | undefined;

  @Input() isOpen: boolean = false;
  @Input() model = new Region();
  @Output() dismiss = new EventEmitter();
  @Output() submit = new EventEmitter();

  constructor(
    private notificationService: NotificationService,
    private modalCtrl: ModalController,
  ) {}

  onDismiss(): void {
    this.dismiss.emit();
    this.modalCtrl.dismiss();
  }

  ngOnChanges(): void {
    if (!!this.model?.imageUrl) {
      this.imageUrl = this.model.imageUrl;
    }
  }

  submitForm(): void {
    this.submit.emit(this.model);
    this.onDismiss()
  }

  onBeforeUpload() {
    this.loading = true
  }

  onUpload(event: any) {
    this.uploadedFiles = [];
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.imageUrl = event.originalEvent.body;
    this.model.imageUrl = event.originalEvent.body;
    this.notificationService.showSuccessNotification(
      "upload image successfully",
    );
    this.loading = false
  }
}
