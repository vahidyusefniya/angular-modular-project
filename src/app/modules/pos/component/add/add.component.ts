import { HttpClient } from "@angular/common/http";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import {
  CoreService,
  LoadingService,
  NotificationService,
} from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  CreatePosRequest,
  Currency,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { environment } from "@environments/environment";
import { ModalController } from "@ionic/angular";
import { MaskitoElementPredicateAsync, MaskitoOptions } from "@maskito/core";
import { maskitoNumberOptionsGenerator } from "@maskito/kit";
import { Subscription } from "rxjs";

@Component({
  selector: "app-add",
  templateUrl: "./add.component.html",
  styleUrls: ["./add.component.scss"],
})
export class AddComponent implements OnInit {
  dictionary = dictionary;
  loading = false;
  branchId: number | undefined;
  price: string | undefined;
  initPage$ = new Subscription();
  description: string | undefined
  name: string | undefined
  currency: Currency | undefined
  getCategories$ = new Subscription();
  uploadImageUrl = `${environment.Base__Url}/api/v1/system/upload-image`;
  uploadedFiles: any[] = [];
  imageUrl: string | undefined;

  pos = new CreatePosRequest()

  @Input() isOpen = false;

  @Output() newPosClick = new EventEmitter<CreatePosRequest>();
  @Output() dismiss = new EventEmitter();

  readonly thousandSeparator: MaskitoOptions = maskitoNumberOptionsGenerator({
    thousandSeparator: ",",
    precision: environment.precision,
  });
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) =>
    (el as HTMLIonInputElement).getInputElement();

  constructor(
    private coreService: CoreService,
    private layoutService: LayoutService,
    private modalCtrl: ModalController,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private router: Router,
    private http: HttpClient,
  ) {
    this.branchId = this.coreService.getBranchId();
    this.layoutService.checkPagePermission("PosWrite");
  }

  ngOnInit() {
    this.layoutService.checkPagePermission("PosWrite");
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
    this.pos.imageUri = event.originalEvent.body;
    this.notificationService.showSuccessNotification(
      "upload image successfully",
    );
    this.loading = false
  }

  onNewPosClick() {
    this.pos.price = parseFloat(
      (this.pos.price?.toString() as any).replace(/,/g, "")
    );
    this.newPosClick.emit(this.pos);
    this.onDismiss();
  }

  changeCurrency(currency: Currency) {
    this.pos.currencyId = currency.currencyId
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onCreateGatewayList() {
    
  }

  ngOnDestroy(): void {
  }
}
