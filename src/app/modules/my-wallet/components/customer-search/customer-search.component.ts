// noinspection JSIgnoredPromiseFromCall

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Branch } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-customer-search",
  templateUrl: "./customer-search.component.html",
  styleUrls: ["./customer-search.component.scss"],
})
export class CustomerSearchComponent implements OnInit {
  dictionary = dictionary;
  @Input() customers: Branch[] = [];
  filterCustomers: Branch[] = [];

  @Input() isOpen = false;

  @Output() dismiss = new EventEmitter();
  @Output() select = new EventEmitter<Branch>();
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.filterCustomers = this.customers;
  }
  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
  searchCustomer(event: any) {
    this.filterList(event.target.value);
  }
  filterList(searchQuery: any) {
    if (!searchQuery) {
      this.filterCustomers = [...this.customers];
    } else {
      const normalizedQuery = searchQuery.toLowerCase();
      this.filterCustomers = this.customers.filter((item) => {
        return item.branchName.toLowerCase().includes(normalizedQuery);
      });
    }
  }

  selectCustomer(customer: Branch) {
    this.select.emit(customer);
    this.onDismiss();
  }
}
