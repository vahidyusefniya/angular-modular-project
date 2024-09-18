// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

interface ITimezone {
  id: number
  code: string,
  time_diff: string,
  time_diff_summer: string
}

@Component({
  selector: "app-timezones",
  templateUrl: "./timezones.component.html",
  styleUrls: ["./timezones.component.scss"],
})



export class TimezonesComponent implements OnInit {
  dictionary = dictionary;
  searchTerm: string | undefined
  @Input() selectedObject: ITimezone | undefined;
  @Input() isOpen = false;
  @Input() data: ITimezone[] = [];
  @Input() title: string = ''
  @Output() select = new EventEmitter<ITimezone>();
  @Output() dismiss = new EventEmitter();
  dataCopy: ITimezone[] = [];
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.dataCopy = [...this.data]
  }

  searchName() {
    this.data = this.dataCopy.filter(x=> x.code.toUpperCase().includes(this.searchTerm!.toUpperCase()) || x.time_diff.includes(this.searchTerm!))
  }

  onClickSave(item: ITimezone): void {
    this.selectedObject = item
    this.select.emit(this.selectedObject);
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  cancel(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
