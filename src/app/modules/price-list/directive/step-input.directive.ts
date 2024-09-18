import { Directive } from "@angular/core";
import { AbstractControl, NG_VALIDATORS, Validator } from "@angular/forms";

@Directive({
  selector: "[appStepInput]",
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: StepInputDirective,
      multi: true,
    },
  ],
})
export class StepInputDirective implements Validator {
  validate(control: AbstractControl): { [key: string]: any } | null {
    if (control.value && (control.value < 1 || isNaN(Number(control.value)))) {
      return { stepInvalid: true };
    }
    return null;
  }
}
