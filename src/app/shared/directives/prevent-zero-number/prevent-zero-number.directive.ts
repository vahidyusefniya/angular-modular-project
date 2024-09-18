import { Directive, ElementRef, HostListener, Input } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  selector: "[appPreventZeroNumber]",
})
export class PreventZeroNumberDirective {
  @Input("appPreventZeroNumber") isActive: boolean = false;
  constructor(private elementRef: ElementRef, private ngControl: NgControl) {}
  @HostListener("input", ["$event"])
  onKeyDown(event: InputEvent) {
    if (this.isActive) {
      if (event.data === "0") {
        this.ngControl.reset()
        this.elementRef.nativeElement.value = undefined;
      }
    }
  }
}
