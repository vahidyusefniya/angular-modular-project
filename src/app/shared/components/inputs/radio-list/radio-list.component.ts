// noinspection JSIgnoredPromiseFromCall

import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";

import { dictionary } from "@dictionary/dictionary";
import { IonInput, ModalController } from "@ionic/angular";
import { IRadioSelect } from "./radioList.model";

@Component({
  selector: "app-radio-list",
  templateUrl: "./radio-list.component.html",
  styleUrls: ["./radio-list.component.scss"],
})
export class RadioListComponent implements OnInit, AfterViewInit {
  dictionary = dictionary;
  searchTerm: string | undefined;
  dataCopy: IRadioSelect[] = [];

  @Input() selectedObject: IRadioSelect | undefined;
  @Input() isOpen = false;
  @Input() data: IRadioSelect[] = [];
  @Input() title: string = "";
  @Output() select = new EventEmitter<IRadioSelect>();
  @Output() dismiss = new EventEmitter();
  @ViewChild("searchInput") searchInput!: IonInput;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.dataCopy = [...this.data];
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.setFocus();
      }
    }, 200);
  }

  searchName() {
    this.data = this.dataCopy.filter((x) =>
      x.name.toUpperCase().includes(this.searchTerm!.toUpperCase())
    );
  }

  onClickSave(item: IRadioSelect): void {
    this.selectedObject = item;
    this.select.emit(this.selectedObject);
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  cancel(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
