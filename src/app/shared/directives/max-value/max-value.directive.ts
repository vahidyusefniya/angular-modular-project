import { Directive, Input } from "@angular/core";
import { AbstractControl, NG_VALIDATORS, Validator } from "@angular/forms";

@Directive({
  selector: "[maxValue]",
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: MaxValueDirective,
      multi: true,
    },
  ],
})
export class MaxValueDirective implements Validator {
  @Input() maxValueNumber: number = 0;

  validate(control: AbstractControl): { [key: string]: any } | null {
    if (control.value && typeof control.value === "string") {
      let priceWithoutComma = control.value.replace(/,/g, "");
      let value = Number(priceWithoutComma);
      if (value < 1 || value > this.maxValueNumber || isNaN(value)) {
        return { maxValueInvalid: true };
      } else {
        return null;
      }
    }
    return null;
  }
}
