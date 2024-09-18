import { Directive, Input } from "@angular/core";
import { AbstractControl, NG_VALIDATORS, Validator } from "@angular/forms";

@Directive({
  selector: "[minValue]",
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: MinValueDirective,
      multi: true,
    },
  ],
})
export class MinValueDirective implements Validator {
  @Input() minValueNumber: number = 0;

  validate(control: AbstractControl): { [key: string]: any } | null {
    if (control.value && typeof control.value === "string") {
      
      let priceWithoutComma = control.value.replace(/,/g, "");
      let value = Number(priceWithoutComma);
      if(!!value) {
        if (value <= this.minValueNumber || isNaN(value)) {
          return { minValueInvalid: true };
        }
      }else{
        return { minValueInvalid: true };
      }
    }
    return null;
  }
}
