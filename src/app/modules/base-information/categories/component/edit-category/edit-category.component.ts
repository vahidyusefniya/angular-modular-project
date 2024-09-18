// noinspection JSIgnoredPromiseFromCall

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
} from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { Subscription } from "rxjs";
import { PatchOfUri, UpdateCategoryRequest } from "@app/proxy/proxy";
import { environment } from "@environments/environment";
import { NotificationService } from "@app/core/services";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-edit-category",
  templateUrl: "./edit-category.component.html",
  styleUrls: ["./edit-category.component.scss"],
})
export class EditCategoryComponent implements OnChanges {
  dictionary = dictionary;
  loading = false;
  getCategories$ = new Subscription();
  uploadImageUrl = `${environment.Base__Url}/api/v1/system/upload-image`;
  uploadedFiles: any[] = [];
  imageUrl = new PatchOfUri();

  @Input() isOpen: boolean = false;
  @Input() model = new UpdateCategoryRequest();
  @Output() dismiss = new EventEmitter();
  @Output() submit = new EventEmitter();

  constructor(
    private notificationService: NotificationService,
    private modalCtrl: ModalController,
  ) {}

  ngOnChanges(): void {
    if (!!this.model?.imageUrl) {
      this.imageUrl = this.model.imageUrl;
    }
  }

  onDismiss(): void {
    this.uploadedFiles = [];
    this.modalCtrl.dismiss();
    this.dismiss.emit();
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

  submitForm(): void {
    this.uploadedFiles = [];
    let data = {
      categoryName: {
        value: this.model.categoryName,
      },
      imageUrl: {
        value: this.model.imageUrl,
      },
    };
    this.modalCtrl.dismiss();
    this.submit.emit(data);
  }

  ngOnDestroy(): void {
    this.getCategories$.unsubscribe();
  }
}
