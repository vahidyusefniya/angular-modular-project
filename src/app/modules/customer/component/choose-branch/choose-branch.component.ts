// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Branch } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-choose-branch-customer",
  templateUrl: "./choose-branch.component.html",
  styleUrls: ["./choose-branch.component.scss"],
})
export class ChooseBranchComponent implements OnInit {
  dictionary = dictionary;
  branch: Branch | undefined;

  @Input() isOpen = false;
  @Input() branches: Branch[] = [];
  @Input() selectedBranch: Branch | undefined;

  @Output() assign = new EventEmitter();
  @Output() setSelectedBranch = new EventEmitter<Branch>();
  @Output() dismiss = new EventEmitter();

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.selectedBranch) this.branch = this.selectedBranch;
  }

  getBranchName(branch: Branch): string | undefined {
    return branch.branchName;
  }

  onClickSave(): void {
    this.assign.emit();
  }

  cancel(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
