// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NotificationService } from "@app/core/services";
import { CreateCategoryRequest } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { environment } from "@environments/environment";
import { ModalController } from "@ionic/angular";
import { Subscription } from "rxjs";
@Component({
  selector: "app-add-category",
  templateUrl: "./add-category.component.html",
  styleUrls: ["./add-category.component.scss"],
})
export class AddCategoryComponent {
  dictionary = dictionary;
  loading = false;
  getCategories$ = new Subscription();
  uploadImageUrl = `${environment.Base__Url}/api/v1/system/upload-image`;
  uploadedFiles: any[] = [];
  imageUrl: string | undefined;

  @Input() isOpen: boolean = false;
  @Input() model = new CreateCategoryRequest();
  @Output() dismiss = new EventEmitter();
  @Output() submit = new EventEmitter();

  constructor(
    private notificationService: NotificationService,
    private modalCtrl: ModalController,
  ) {}
  onDismiss(): void {
    this.uploadedFiles = [];
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onBeforeUpload() {
    this.loading = true
  }

  submitForm(): void {
    this.uploadedFiles = [];
    this.submit.emit(this.model);
    this.modalCtrl.dismiss();
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

  ngOnDestroy(): void {
    this.getCategories$.unsubscribe();
  }
}
