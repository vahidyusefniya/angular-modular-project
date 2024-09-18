import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import {
  CreateSaleManagerRequest,
  Phone,
  SaleManager,
  UserRole,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-edit-modal",
  templateUrl: "./edit-modal.component.html",
  styleUrls: ["./edit-modal.component.scss"],
})
export class EditModalComponent implements OnInit {
  dictionary = dictionary;
  branchId: number;
  teamLists: UserRole[] = [];
  updatedData!: any;
  modalName!: string;
  phone = new Phone();

  @Input() saleManager = new SaleManager();
  @Input() isOpen = false;
  @Input() title: string = "";

  @Output() submitEditSaleManager =
    new EventEmitter<CreateSaleManagerRequest>();
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private coreService: CoreService
  ) {
    this.branchId = coreService.getBranchId()!;
    this.modalName = this.saleManager.name;
  }

  ngOnInit(): void {
    this.phone.init({
      countryCode: "",
      number: "",
    });
  }

  onSaveClick(): void {
    this.updatedData = {
      email: { value: this.saleManager.email },
      phoneNumber: { value: this.saleManager.phoneNumber },
      isActive: { value: this.saleManager.isActive },
      name: { value: this.saleManager.name },
    };
    this.submitEditSaleManager.emit(this.updatedData);
    this.onDismiss();
  }

  validateNumberInput(event: any) {
    this.coreService.checkNumberInput(event);
  }

  phoneNumberChange(value: Phone) {
    this.saleManager.phoneNumber = value;
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
