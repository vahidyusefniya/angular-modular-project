// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { CreateBranchRequest } from "@app/modules/branch/dto/branch.dto";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-customer-new-branch",
  templateUrl: "./new-branch.component.html",
  styleUrls: ["./new-branch.component.scss"],
})
export class NewCustomerBranchComponent {
  dictionary = dictionary;
  branch = new CreateBranchRequest();

  @Input() isOpen = false;

  @Output() createBranch = new EventEmitter<CreateBranchRequest>();
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private coreService: CoreService
  ) {}

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onNewBranchClick(): void {
    this.branch.branchId = this.coreService.getBranchId();
    this.createBranch.emit(this.branch);
    this.modalCtrl.dismiss();
  }
}
