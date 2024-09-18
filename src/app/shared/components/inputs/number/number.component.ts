import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  Provider,
  ViewChild,
  forwardRef,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { dictionary } from "@dictionary/dictionary";

const NUMBER_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NumberComponent),
  multi: true,
};

@Component({
  selector: "app-number",
  templateUrl: "./number.component.html",
  styleUrls: ["./number.component.scss"],
  providers: [NUMBER_CONTROL_VALUE_ACCESSOR],
})
export class NumberComponent implements AfterViewInit {
  dictionary = dictionary;

  @Input() customCss!: any;
  @Input() Label!: string;
  @Input() placeholder!: string;
  @Input() color: string | undefined;
  @Input() helperText: string | undefined;
  @Input() type: "text" | "number" = "text";
  @Input() errorText: string | undefined;
  @Input() autocomplete = "off";
  @Input() id = "text";
  @Input() required = false;
  @Input() autofocus = false;
  @Input() isDisabled = false;
  @Input() readonly = false;
  @Input() clearInput = false;
  @Input() max = 100000;
  @Input() debounce = 0;
  @Input() min = 0;
  @Input() email = false;
  @Input() pattern = "";
  @Input() inputmode: string | undefined;
  @ViewChild("baseNumberInput") baseInput!: any;

  @Output() inputChange = new EventEmitter<string>();
  @Output() keypress = new EventEmitter<any>();
  @Output() blur = new EventEmitter<any>();
  @Output() ionInput = new EventEmitter<any>();

  value: string | undefined;

  private onTouched!: Function;
  private onChanged!: Function;

  ngAfterViewInit(): void {
    if (this.autofocus) {
      setTimeout(async () => {
        this.baseInput.setFocus();
      }, 500);
    }
  }

  handleChange(change: string): void {
    this.onTouched();
    this.writeValue(change);
    this.onChanged(change);
    this.inputChange.next(change);
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

  // noinspection JSUnusedGlobalSymbols
  setFocus() {
    this.baseInput.setFocus();
  }

  onBlur(event: any): void {
    this.blur.emit(event);
  }

  onKeypress(event: any): void {
    this.keypress.emit(event);
  }

  onIonInput(event: any): void {
    this.ionInput.emit(event);
  }
}
