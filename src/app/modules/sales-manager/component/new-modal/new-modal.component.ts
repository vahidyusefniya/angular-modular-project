import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService, LoadingService } from "@app/core/services";
import {
  CreateSaleManagerRequest,
  Phone,
  TeamClient,
  UserRole,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-new-modal",
  templateUrl: "./new-modal.component.html",
  styleUrls: ["./new-modal.component.scss"],
})
export class NewModalComponent implements OnInit {
  dictionary = dictionary;
  salesManager = new CreateSaleManagerRequest();
  branchId: number;
  teamLists: UserRole[] = [];
  resourceId: string = "056f9453-89eb-469a-b39f-1dfa717eccdc";

  @Input() isOpen = false;
  @Input() title: string = "";
  @Output() submitNewSaleManager = new EventEmitter<CreateSaleManagerRequest>();
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private teamClient: TeamClient,
    private coreService: CoreService,
    private loadingService: LoadingService
  ) {
    this.branchId = coreService.getBranchId()!;
  }

  ngOnInit() {
    // this.salesManager.isActive = false;
    this.getTeamList();
  }

  phoneNumberChange(value: Phone) {
    this.salesManager.phoneNumber = value;
  }

  getTeamList() {
    this.loadingService.present();
    this.teamClient
      .listUserRoles(String(this.branchId), null, null, null, null, -1, null)
      .subscribe({
        next: (res) => {
          this.loadingService.dismiss();
          this.teamLists = res.items;
        },
        error: (error: ResponseErrorDto) => {
          this.loadingService.dismiss();
          throw Error(error.message);
        },
      });
  }

  onSaveClick(): void {
    this.checkUserEmail();
  }

  checkUserEmail() {
    let userFinded = this.teamLists.find(
      (item) => item.user?.email == this.salesManager.email
    );
    if (userFinded) {
      this.salesManager.userId = userFinded.userId;
      this.submitNewSaleManager.emit(this.salesManager);
      this.onDismiss();
    } else {
      this.oncreateUserID();
    }
  }

  async oncreateUserID() {
    this.teamClient
      .addUserByEmail(
        this.branchId.toString(),
        this.resourceId,
        this.salesManager.email
      )
      .subscribe({
        next: (res: UserRole) => {
          this.salesManager.userId = res.userId;
          this.submitNewSaleManager.emit(this.salesManager);
          this.onDismiss();
        },
        error: (err) => {
          throw Error(err.message);
        },
      });
  }

  validateNumberInput(event: any) {
    this.coreService.checkNumberInput(event);
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
