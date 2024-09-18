// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { CreateBranchRequest } from "../../dto/branch.dto";

@Component({
  selector: "app-new-branch",
  templateUrl: "./new-branch.component.html",
  styleUrls: ["./new-branch.component.scss"],
})
export class NewBranchComponent {
  dictionary = dictionary;
  branch = new CreateBranchRequest();
  branchId: number;

  @Input() isOpen = false;

  @Output() createBranch = new EventEmitter<CreateBranchRequest>();
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private coreService: CoreService
  ) {
    this.branchId = this.coreService.getBranchId()!;
  }

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
