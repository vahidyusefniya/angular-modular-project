// noinspection JSIgnoredPromiseFromCall,DuplicatedCode

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { StorageService } from "@app/core/services";
import { LayoutService } from "@app/layout/service/layout.service";
import { Branch } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-choose-branch",
  templateUrl: "./choose-branch.component.html",
  styleUrls: ["./choose-branch.component.scss"],
})
export class ChooseBranchComponent implements OnInit {
  dictionary = dictionary;
  branch: Branch | undefined;

  @Input() isOpen = false;
  @Input() branches: Branch[] = [];
  @Input() selectedBranch: Branch | undefined;
  @Input() state: "init" | "change" = "init";

  @Output() branchSelectionChange = new EventEmitter<Branch>();
  @Output() dismiss = new EventEmitter();

  branchName: string | undefined;
  allBranches: Branch[] = [];
  constructor(
    private modalCtrl: ModalController,
    private layoutService: LayoutService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    if (this.selectedBranch) this.branch = this.selectedBranch;
    this.allBranches = this.branches;
  }

  onFocusBranch(branch: Branch): void {
    this.branch = branch;
    this.storageService.set("defaultBranch", this.branch.branchId);
    this.layoutService.updateBranch(this.branch);
    this.branchSelectionChange.emit(this.branch);
    this.modalCtrl.dismiss();
  }

  getBranchName(branch: Branch): string | undefined {
    let name: string | undefined;
    name =
      branch.branchName === "root"
        ? branch.merchant?.merchantName
        : branch.branchName;

    return name;
  }

  searchName(branch: string) {
    if (branch.trim().length > 0) {
      this.branches = [...this.allBranches].filter(
        (x) =>
          x.merchantName
            .toLocaleLowerCase()
            .includes(branch.toLocaleLowerCase()) ||
          x.branchId == Number(branch) ||
          x.branchName.toLocaleLowerCase().includes(branch.toLocaleLowerCase())
      );
    } else {
      this.branches = [...this.allBranches];
    }
  }

  cancel(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
