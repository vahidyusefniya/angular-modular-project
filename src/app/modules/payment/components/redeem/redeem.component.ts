import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { dictionary } from "@dictionary/dictionary";

@Component({
  selector: "app-redeem",
  templateUrl: "./redeem.component.html",
  styleUrls: ["./redeem.component.scss"],
})
export class RedeemComponent implements OnInit {
  dictionary = dictionary;
  pin: string | undefined;

  @Input() isOpen = false;
  @ViewChild("form") form: any;
  @Output() dismiss = new EventEmitter();
  @Output() submit = new EventEmitter();

  ngOnInit(): void {}
  resetForm(): void {
    this.pin = undefined;
  }

  submitForm(): void {
    if (!this.form.form.valid) {
      return;
    }
    this.submit.emit();
    this.resetForm();
  }

  onDismiss(): void {
    this.resetForm();
    this.dismiss.emit();
  }
}
