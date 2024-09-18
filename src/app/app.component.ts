import { Component, OnInit } from "@angular/core";
import { UpToDateBuildService } from "@app/auto-app-updater";
import { dictionary } from "@dictionary/dictionary";
import { ThemeService } from "@theme/theme.service";
// import { SunmiScanHead } from "@kduma-autoid/capacitor-sunmi-scanhead";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent implements OnInit {
  isDark = false;
  buildIsUpToDate = false;
  alertButtons = [
    {
      text: dictionary.Update,
      role: "confirm",
      handler: () => {
        location.reload();
      },
    },
  ];

  constructor(
    private themeService: ThemeService,
    private upToDateService: UpToDateBuildService
  ) {
    this.upToDateService.buildIsUpToDate.subscribe((buildIsUpToDate) => {
      this.buildIsUpToDate = buildIsUpToDate;
    });
  }

  ngOnInit(): void {
    // SunmiScanHead.bindService();
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        this.isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        this.setTheme();
      });
    this.isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.setTheme();
  }

  setTheme(): void {
    if (this.isDark) {
      this.themeService.switchTheme("md-dark-indigo");
    } else {
      this.themeService.switchTheme("md-light-indigo");
    }
  }
}
