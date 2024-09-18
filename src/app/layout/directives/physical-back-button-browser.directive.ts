import { Directive, HostListener } from "@angular/core";
import { LayoutService } from "@app/layout";

@Directive({
  selector: "[appPhysicalBackButtonBrowser]",
})
export class PhysicalBackButtonBrowserDirective {
  constructor(private layoutService: LayoutService) {}
  event: any;
  @HostListener("window:popstate", ["$event"])
  onPopState(event: any) {
    this.event = event;
    this.layoutService.onBackButtonClick();
  }
}
