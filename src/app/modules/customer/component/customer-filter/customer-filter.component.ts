import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { GatewayList, PriceList, SaleManager } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { CustomerFilterDto, ICustomerFilterDto } from "../../dto/customer.dto";

@Component({
  selector: "app-customer-filter",
  templateUrl: "./customer-filter.component.html",
  styleUrls: ["./customer-filter.component.scss"],
})
export class CustomerFilterComponent implements OnInit {
  dictionary = dictionary;
  filter = new CustomerFilterDto();

  @Input() priceLists: PriceList[] = [];
  @Input() gatewayLists: GatewayList[] = [];
  @Input() saleManagers: SaleManager[] = [];
  @Input() isOpen = false;
  @Input() data: ICustomerFilterDto | undefined;

  @Output() filterCustomer = new EventEmitter<any>();
  @Output() dismiss = new EventEmitter();

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.data) this.filter.init(this.data!);
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onFilterClick(): void {
    this.filterCustomer.emit(this.filter);
    this.modalCtrl.dismiss();
  }
}
