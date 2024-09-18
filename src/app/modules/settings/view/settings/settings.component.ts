import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { LayoutService } from "@app/layout";
import { dictionary } from "@dictionary/dictionary";
import { ITab } from "../../dto/settings.dto";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  dictionary = dictionary;
  tabs: ITab[] = [
    {
      label: dictionary.Security,
      routerLink: "security",
      id: "security",
    },
    {
      label: dictionary.CompanyConfiguration,
      routerLink: "company-configuration",
      id: "companyConfiguration",
    },
  ];
  activeTab: any;
  branchId: number;

  constructor(private router: Router, private layoutService: LayoutService) {
    this.branchId = this.layoutService.branch!.branchId;
  }

  ngOnInit() {
    this.activeTab = this.tabs[0];
    if (this.router.url !== `/branches/${this.branchId}/settings`) return;
    this.router.navigate([`/branches/${this.branchId}/settings/security`]);
  }
}
