import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  Provider,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { LayoutService } from "@app/layout";
import { ComboboxDto } from "./combobox.model";

const COMBOBOX_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ComboboxComponent),
  multi: true,
};

@Component({
  selector: "app-combobox",
  templateUrl: "./combobox.component.html",
  styleUrls: ["./combobox.component.scss"],
  providers: [COMBOBOX_CONTROL_VALUE_ACCESSOR],
})
export class ComboboxComponent {
  @Input() customCss!: any;
  @Input() Label!: string;
  @Input() required = false;
  @Input() disabled = false;
  @Input() loading = false;
  @Input() autofocus = false;
  @Input() filterable = true;
  @Input() hasClear = true;
  @Input() data: any[] = [];
  @Input() valueField = "id";
  @Input() id: string | number | undefined;
  @Input() textField = "name";
  @Input() placeholder: string | undefined;
  @Input() includeClear = false;

  @Output() filterChange = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any>();

  value: any;
  selectedValue = new ComboboxDto();

  isMobileSize = false;

  private onTouched!: Function;
  private onChanged!: Function;

  constructor(private layoutService: LayoutService) {
    this.isMobileSize = this.layoutService.checkMobileSize();
  }

  handleChange(change: any): void {
    this.onTouched();
    this.writeValue(change);
    this.onChanged(change);
    this.selectionChange.emit(change);
  }
  writeValue(value: any): void {
    this.value = value;
    this.initSelectedValue(value);
  }
  // noinspection JSUnusedGlobalSymbols
  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }
  // noinspection JSUnusedGlobalSymbols
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // noinspection JSUnusedGlobalSymbols
  onFilterChange(input: any): void {
    this.filterChange.emit(input);
  }
  initSelectedValue(change: any): void {
    if (!change) return;
    let value: any;
    if (Array.isArray(change)) {
      value = this.data.find((d) => this.isEqual(d[this.valueField], change));
    } else {
      value = this.data.find((d) => d[this.valueField] === change);
    }
    if (!value) return;
    this.value = value[this.valueField];
    this.selectedValue.init({
      fontStyle: value.fontStyle,
      fontName: value.fontName,
      textField: value[this.textField],
      valueField: value[this.valueField],
    });
  }
  isEqual(a: any[], b: any[]): boolean {
    if (!Array.isArray(a) || !Array.isArray(b)) return true;
    return a.join() == b.join();
  }
}
