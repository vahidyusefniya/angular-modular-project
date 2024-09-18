import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CoreService } from '@app/core/services';
import { Branch } from '@app/proxy/proxy';
import { dictionary } from '@dictionary/dictionary';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-customer-modal',
  templateUrl: './customer-modal.component.html',
  styleUrls: ['./customer-modal.component.scss'],
})
export class CustomerModalComponent implements OnInit {
  dictionary = dictionary;
  customerName: Branch[] = []
  customersList: Branch[] = []
  allCustomers: Branch[] = [];
  customerChoosed!: Branch;

  @Input() isOpen = false;
  @Input() selectedCustomer: string | undefined;
  @Input() data: Branch[] | undefined;

  @Output() chooseCustomer = new EventEmitter<Branch>();
  @Output() dismiss = new EventEmitter();

  @ViewChild("customerModal") customerModal!: IonModal;

  constructor(
    public coreService: CoreService
  ) { }


  ngOnInit() {
    if (this.selectedCustomer) {
      this.customerChoosed = this.data?.filter(item => item.merchantName === this.selectedCustomer)[0]!;
    }
    this.customersList = this.data!;
    this.allCustomers = this.customersList;
  }

  searchName(branch: string) {
    if (branch.trim().length > 0) {
      this.customersList = [...this.allCustomers].filter((x) =>
        x.merchantName.toLowerCase().includes(branch.toLocaleLowerCase())
      );
    } else {
      this.customersList = [...this.allCustomers];
    }
  }

  handleChange(data: any) {
    this.chooseCustomer.emit(data.target.value);
    this.customerModal.dismiss();

  }

  onDismiss(): void {
    this.customerModal.dismiss();
    this.dismiss.emit();
  }
}
