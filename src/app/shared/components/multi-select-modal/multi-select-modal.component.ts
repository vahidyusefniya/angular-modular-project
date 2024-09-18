// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

export interface IMultiSelectModalData {
  value: Array<string> | Array<number> | null;
  text: string | undefined;
}

interface IData {
  text: string;
  value: string | number;
  checked: boolean;
  icon: string;
}

@Component({
  selector: "app-multi-select-modal",
  templateUrl: "./multi-select-modal.component.html",
  styleUrls: ["./multi-select-modal.component.scss"],
})
export class MultiSelectModalComponent implements OnInit {
  dictionary = dictionary;
  values: any[] | null = [];
  data: IData[] = [];
  allCheckedProp = false;
  showAllOption: boolean = true;
  @Input() inputData: any[] = [];
  @Input() selectedValue: any[] | null = [];
  @Input() valueField = "id";
  @Input() isOpen = false;
  @Input() textField = "name";
  @Input() title: string | undefined;
  @Input() confirmBtnText = dictionary.Confirm;
  @Input() cancelBtnText = dictionary.Cancel;
  @Input() hasSearch = false;
  @Input() hasAllOption = true;
  @Output() confirm = new EventEmitter<IMultiSelectModalData>();
  @Output() dismiss = new EventEmitter();
  filteredItems: IData[] = [];

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.values = this.selectedValue;
    this.inputData.forEach((item) => {
      this.data.push({
        checked: false,
        value: item[this.valueField],
        text: item[this.textField],
        icon: !!item.icon ? item.icon : null,
      });
    });

    this.filteredItems = this.data;
    if (this.values == null) {
      this.allCheckedProp = true;
      this.values = null;
    } else {
      this.filteredItems.forEach((item) => {
        const findItem = this.values?.find((s) => s === item.value);
        item.checked = !!findItem;
      });
    }
  }

  onChangeAll(event: any): void {
    if (event.target.checked) this.values = null;
    else this.values = [];
    this.setCheckedPropSelectedItem(null);
  }

  onChangeItem(event: any): void {
    if (!this.values) return;
    const value = event.target.value;
    if (event.target.checked) {
      this.values.push(value);
    } else {
      const index = this.values.indexOf(value);
      if (index == -1) return;
      this.values.splice(index, 1);
    }
    this.setCheckedPropSelectedItem(value);
  }

  setCheckedPropSelectedItem(value: string | number | null): void {
    this.data.forEach((item) => {
      const findItem = this.values?.find((v) => v == item.value);
      if (value == null) item.checked = false;
      else {
        item.checked = !!findItem;
      }
    });
  }

  onConfirmClick(): void {
    const confirm: IMultiSelectModalData = {
      value: this.values,
      text: this.initOutputText(),
    };
    this.confirm.emit(confirm);
    this.didDismiss();
  }

  initOutputText(): string {
    if (this.values == null) return dictionary.All;
    else {
      const selectedValuesTexts: string[] = [];
      const selectedItems = this.data.filter((d) => d.checked);
      selectedItems.forEach((item) => {
        selectedValuesTexts.push(item.text);
      });
      return selectedValuesTexts.join(", ");
    }
  }

  onSearchInput(event: any) {
    this.filterList(event.target.value);
  }

  filterList(searchQuery: string | undefined) {
    if (!searchQuery) {
      this.showAllOption = true;

      this.filteredItems = [...this.data];
    } else {
      this.showAllOption = false;
      this.allCheckedProp = this.values == null;
      const normalizedQuery = searchQuery.toLowerCase();
      this.filteredItems = this.data.filter((item) => {
        return item.text.toLowerCase().includes(normalizedQuery);
      });
    }
  }

  didDismiss() {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
