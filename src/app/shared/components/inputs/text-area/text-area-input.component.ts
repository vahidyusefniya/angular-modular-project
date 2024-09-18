import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  Provider,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

const TEXT_AREA_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TextAreaInputComponent),
  multi: true,
};

@Component({
  selector: "app-text-area-input",
  templateUrl: "./text-area-input.component.html",
  styleUrls: ["./text-area-input.component.scss"],
  providers: [TEXT_AREA_CONTROL_VALUE_ACCESSOR],
})
export class TextAreaInputComponent {
  @Input() Label = "Description";
  @Input() minRows = 2;
  @Input() maxRows = 5;
  @Input() required = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() maxlength = 500;
  @Input() minlength = 0;
  @Input() id = "text-area";
  @Input() placeholder: string | undefined;
  @Output() onChange = new EventEmitter<any>();

  value: string | undefined;

  private onTouched!: Function;
  private onChanged!: Function;

  handleChange(change: string): void {
    this.onTouched();
    this.writeValue(change);
    this.onChanged(change);
  }
  writeValue(value: string): void {
    this.value = value;
  }
  // noinspection JSUnusedGlobalSymbols
  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }
  // noinspection JSUnusedGlobalSymbols
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onFocusEvent(event: any) {
    setTimeout(() => {
      event.target?.scrollIntoView();
    }, 200);
  }
}
