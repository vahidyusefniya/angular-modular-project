import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  Output,
  Provider,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { CoreService } from "@app/core/services";

const DATEPICKER_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatePickerComponent),
  multi: true,
};

@Component({
  selector: "app-date-picker",
  templateUrl: "./date-picker.component.html",
  styleUrls: ["./date-picker.component.scss"],
  providers: [DATEPICKER_CONTROL_VALUE_ACCESSOR],
})
export class DatePickerComponent implements OnChanges {
  value: Date | undefined;
  max = new Date();
  min = new Date(2000, 1, 1);

  @Input() Label!: string;
  @Input() id = "date-picker";
  @Input() required = false;
  @Input() showDefaultButtons = true;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() autofocus = false;
  @Input() maxDate: string | undefined;
  @Input() minDate: string | undefined;

  @Output() selectionChange = new EventEmitter<any>();

  private onTouched!: Function;
  private onChanged!: Function;

  constructor(private coreService: CoreService) {}

  ngOnChanges(): void {
    this.max = this.maxDate ? new Date(this.maxDate) : this.max;
    this.min = this.minDate ? new Date(this.minDate) : this.min;
  }

  handleChange(change: any): void {
    this.onTouched();
    this.writeValue(change);
    this.onChanged(change);
    this.selectionChange.emit(this.coreService.changeFormatDate(change));
  }
  writeValue(value: Date | string | undefined): void {
    if (typeof value === "string") {
      this.value = new Date(value);
    } else this.value = value;
  }
  // noinspection JSUnusedGlobalSymbols
  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }
  // noinspection JSUnusedGlobalSymbols
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  inputValueChange(event: any): void {
    if (event.target.value === "") this.handleChange(undefined);
  }
}
