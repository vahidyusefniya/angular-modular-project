import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreService, LoadingService } from '@app/core/services';
import { Branch, BranchesClient } from '@app/proxy/proxy';
import { dictionary } from '@dictionary/dictionary';
import { ModalController } from '@ionic/angular';
import { SalesManagerService } from '../../service/sales-manager.service';

@Component({
  selector: 'app-choose-customer',
  templateUrl: './choose-customer.component.html',
  styleUrls: ['./choose-customer.component.scss'],
})
export class ChooseCustomerComponent implements OnInit {
  dictionary = dictionary;
  customerName: Branch[] = [];
  allCustomers: Branch[] = [];
  customer: Branch | undefined;
  branchId: number;
  customersList: Branch[] = []
  saleManagerName: string;
  selectedCustomer: number[] = [];
  loading: boolean = false;


  @Input() isOpen = false;
  @Output() dismiss = new EventEmitter();
  @Output() setSelectedCustomer = new EventEmitter<number[]>();



  constructor(
    private modalCtrl: ModalController,
    private branchClient: BranchesClient,
    private coreService: CoreService,
    private loadingService: LoadingService,
    private salesService: SalesManagerService
  ) {
    this.branchId = coreService.getBranchId()!;
    this.saleManagerName = this.salesService.getSaleManager?.name!
  }

  ngOnInit() {
    this.getUnAssignCustomer();
  }


  getUnAssignCustomer() {
    this.loadingService.present();
    this.loading = true;
    this.branchClient.getSubMerchants(this.branchId, null, false, false).subscribe({
      next: (res) => {
        this.customersList = res;
        this.allCustomers = this.customersList;
        this.loading = false;
      }, error: (err) => {
        throw Error(err.message);
      },
      complete: () => {
        this.loadingService.dismiss();
      }
    })
  }

  handleChange(data: Branch) {
    const findId = this.selectedCustomer.findIndex(id => id === data.merchantId);
    findId > -1 ? this.selectedCustomer.splice(findId, 1) : this.selectedCustomer.push(data.merchantId);
  }

  cancel(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onClickSave(): void {
    this.setSelectedCustomer.emit(this.selectedCustomer);
    this.cancel();
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

}
