import { Directive, HostListener } from "@angular/core";
import { LayoutService } from "@app/layout";

@Directive({
  selector: "[appResize]",
})
export class ResizeDirective {
  constructor(private layoutService: LayoutService) {}

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    let width = event.target.innerWidth;
    if (width < 600) this.layoutService.checkMobileSize();
    else this.layoutService.checkMobileSize();
  }
}
