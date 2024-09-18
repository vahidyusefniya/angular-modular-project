import { Component, OnInit } from "@angular/core";
import { LayoutService } from "@app/layout";
import { Branch } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";

@Component({
  selector: "app-forbidden",
  templateUrl: "./forbidden.component.html",
  styleUrls: ["./forbidden.component.scss"],
})
export class ForbiddenComponent implements OnInit {
  dictionary = dictionary;
  branches: Branch[] = [];
  branchesCmbData: Array<{ name: string; id: number }> = [];
  loading = false;
  branch: Branch | undefined;

  constructor(private layoutService: LayoutService) {}

  ngOnInit() {
    this.branches = this.layoutService.branches;
    if (this.branches && this.branches.length > 0) {
      this.branches.forEach((branch) => {
        this.branchesCmbData.push({
          name:
            branch.branchName === "root"
              ? branch.merchant!.merchantName
              : `${branch.merchant?.merchantName} (${branch.branchName})`,
          id: branch.branchId,
        });
      });
      if (this.branches.length == 0) {
        this.branch = this.branches[0];
        this.branchSelectionChange(this.branch.branchId);
      }
    }
  }

  branchSelectionChange(branchId: number): void {
    const branch = this.branches.find((b) => b.branchId == branchId);
    const url =
      this.layoutService.getDeviceMode() === "desktop"
        ? `${location.origin}/branches/${branchId}/shop`
        : `${location.origin}/branches/${branchId}/eGift`;
    this.layoutService.updateBranch(branch!);
    location.href = url;
  }
}
