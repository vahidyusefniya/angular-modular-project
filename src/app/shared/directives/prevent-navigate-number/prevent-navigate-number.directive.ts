import { Directive, ElementRef, HostListener, Input } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  selector: "[appPreventNavigateNumber]",
})
export class PreventNavigateNumberDirective {
  @Input("appPreventNavigateNumber") isActive: boolean = false;
  constructor(private elementRef: ElementRef, private ngControl: NgControl) {}
  @HostListener("input", ["$event"])
  onKeyDown(event: InputEvent) {
    if (this.isActive) {
      if (event.data === "-") {
        this.ngControl.reset()
        this.elementRef.nativeElement.value = undefined;
      }
    }
  }
}
