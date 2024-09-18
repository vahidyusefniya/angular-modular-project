import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  Provider,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

const MULTI_SELECT_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MultiSelectComponent),
  multi: true,
};

@Component({
  selector: "app-multi-select",
  templateUrl: "./multi-select.component.html",
  styleUrls: ["./multi-select.component.scss"],
  providers: [MULTI_SELECT_CONTROL_VALUE_ACCESSOR],
})
export class MultiSelectComponent {
  @Input() Label!: string;
  @Input() required = false;
  @Input() disabled = false;
  @Input() loading = false;
  @Input() filterable = false;
  @Input() autofocus = false;
  @Input() data: any[] = [];
  @Input() valueField = "id";
  @Input() textField = "name";
  @Input() id = "select";
  @Input() placeholder: string | undefined;

  @Output() selectionChange = new EventEmitter<any[]>();

  value: any[] = [];

  private onTouched!: Function;
  private onChanged!: Function;

  handleChange(change: any): void {
    this.onTouched();
    this.writeValue(change);
    this.onChanged(change);
    this.selectionChange.emit(change);
  }
  writeValue(value: any[]): void {
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
}
