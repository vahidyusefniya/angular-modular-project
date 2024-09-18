import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreService } from '@app/core/services';
import { dictionary } from '@dictionary/dictionary';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-wheel-datepicker',
  templateUrl: './wheel-datepicker.component.html',
  styleUrls: ['./wheel-datepicker.component.scss'],
})
export class WheelDatepickerComponent implements OnInit {
  dictionary = dictionary;
  date: any | undefined;

  @Input() isOpen = false;

  @Output() dismiss = new EventEmitter();
  @Output() selectionDate = new EventEmitter<any>();


  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() { }

  onDismiss() {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
    this.date = undefined;
  }

  saveDate() {
    if (this.date) {
      this.selectionDate.emit(this.date);
    } else {
      let d = new Date();
      d.toISOString();
      this.selectionDate.emit(this.convertToEndOfDay(d));
    }
    this.onDismiss();
  }

  handleChange(ev: any) {
    this.date = this.convertToEndOfDay(ev.target.value);
  }

  convertToEndOfDay(dateString: any) {
    let date = new Date(dateString);
    date.setHours(0, 0, 0, 1);
    return date.toISOString();
  }


}
