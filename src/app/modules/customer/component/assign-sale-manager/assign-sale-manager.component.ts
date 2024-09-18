import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LoadingService } from '@app/core/services';
import { Branch, SaleManager, SaleManagersClient } from '@app/proxy/proxy';
import { dictionary } from '@dictionary/dictionary';
import { ModalController } from '@ionic/angular';
import { CustomerService } from '../../service/customer.service';

@Component({
  selector: 'app-assign-sale-manager',
  templateUrl: './assign-sale-manager.component.html',
  styleUrls: ['./assign-sale-manager.component.scss'],
})
export class AssignSaleManagerComponent implements OnInit {

  dictionary = dictionary;
  selectedSaleManger!: SaleManager;
  saleManagerName!: SaleManager;
  saleManagerList: SaleManager[] = [];
  allSaleManagerList: SaleManager[] = [];
  branch: Branch | undefined;
  loading: boolean = false;



  @Input() isOpen = false;
  @Input() selectedSaleManagerId!: number;
  @Output() dismiss = new EventEmitter();
  @Output() setSelectedSaleManager = new EventEmitter<SaleManager>();


  constructor(
    private saleManagerService: SaleManagersClient,
    private modalCtrl: ModalController,
    private loadingService: LoadingService,
    private customerService: CustomerService,
  ) {
    this.branch = this.customerService.branch;

  }

  ngOnInit() {
    this.getSaleManagerList();
  }


  getSaleManagerList() {
    this.loadingService.present();
    this.loading = true;
    this.saleManagerService.getSaleManagers(this.branch?.merchant?.parentBranchId!, true).subscribe({
      next: (res) => {
        this.saleManagerList = res;
        this.allSaleManagerList = this.saleManagerList;
        this.loading = false;
      }, error: (err) => {
        throw Error(err.message);
      },
      complete: () => {
        this.loadingService.dismiss();
      }
    })
  }

  cancel(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onClickSave(): void {
    this.setSelectedSaleManager.emit(this.selectedSaleManger);
    this.cancel();
  }

  handleChange(data: any) {
    this.selectedSaleManger = this.saleManagerList.find(item => item.saleManagerId == data.target.value)!;
  }

  searchName(branch: string) {
    if (branch.trim().length > 0) {
      this.saleManagerList = [...this.allSaleManagerList].filter((x) =>
        x.name.toLowerCase().includes(branch.toLocaleLowerCase())
      );
    } else {
      this.saleManagerList = [...this.allSaleManagerList];
    }
  }

}
