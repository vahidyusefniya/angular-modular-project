import {
  AfterViewInit,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  Provider,
  ViewChild,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { dictionary } from "@dictionary/dictionary";
import { IonInput } from "@ionic/angular";
import { MaskitoElementPredicateAsync } from "@maskito/core";

const TEXT_CONTROL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TextComponent),
  multi: true,
};

@Component({
  selector: "app-text",
  templateUrl: "./text.component.html",
  styleUrls: ["./text.component.scss"],
  providers: [TEXT_CONTROL_VALUE_ACCESSOR],
})
export class TextComponent implements ControlValueAccessor, AfterViewInit {
  dictionary = dictionary;

  @Input() customCss!: any;
  @Input() Label!: string;
  @Input() placeholder!: string;
  @Input() color: string | undefined;
  @Input() helperText: string | undefined;
  @Input() type: "text" | "number" | "password" = "text";
  @Input() errorText: string | undefined;
  @Input() autocomplete = "off";
  @Input() id = "text";
  @Input() required = false;
  @Input() autofocus = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() clearInput = false;
  @Input() maxlength = 100000;
  @Input() debounce = 0;
  @Input() minlength = 0;
  @Input() email = false;
  @Input() pattern = "";
  @Input() mask: any;
  @Input() inputmode: string | undefined;
  @Input() isPreventNavigateNumber: boolean = false;
  @Input() isPreventZeroNumber: boolean = false;
  @Input() loading: boolean = false;

  @ViewChild("baseInput") baseInput!: IonInput;

  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) =>
    (el as HTMLIonInputElement).getInputElement();

  @Output() inputChange = new EventEmitter<string>();
  @Output() keypress = new EventEmitter<any>();
  @Output() keyup = new EventEmitter<any>();
  @Output() blur = new EventEmitter<any>();
  @Output() ionInput = new EventEmitter<any>();

  value: string | undefined;
  showPassword: boolean = false;

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
  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onBlur(event: any): void {
    this.blur.emit(event);
  }

  onKeypress(event: any): void {
    this.keypress.emit(event);
  }

  onKeyup(event: any): void {
    this.keyup.emit(event);
  }

  onIonInput(event: any): void {
    this.ionInput.emit(event);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
