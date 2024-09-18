import { Directive, HostListener, Input } from "@angular/core";
// import { LocationStrategy } from "@angular/common";

@Directive({
  selector: "[appDirtyPage]",
})
export class DirtyPageDirective {
  @Input("appDirtyPage") isDirtyPage = false;

  // constructor(private location: LocationStrategy) {
  //   history.pushState(null, "", window.location.href);
  //   this.location.onPopState(() => {
  //     history.pushState(null, "", window.location.href);
  //   });
  // }

  @HostListener("window:beforeunload", ["$event"])
  onEvent(event: any) {
    if (this.isDirtyPage) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }
}
