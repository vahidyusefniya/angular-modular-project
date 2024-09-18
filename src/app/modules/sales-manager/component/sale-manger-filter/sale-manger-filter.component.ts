import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { SaleManagerFilterDto } from "../../dto/sales-manager.dto";

@Component({
  selector: "app-sale-manger-filter",
  templateUrl: "./sale-manger-filter.component.html",
  styleUrls: ["./sale-manger-filter.component.scss"],
})
export class SaleMangerFilterComponent implements OnInit {
  dictionary = dictionary;
  filterSaleManager = new SaleManagerFilterDto();
  activeList = [
    {
      statusName: dictionary.Active,
      statusValue: true,
    },
    {
      statusName: dictionary.Deactive,
      statusValue: false,
    },
  ];

  @Output() dismiss = new EventEmitter();
  @Output() saleMangerFilterClick = new EventEmitter<SaleManagerFilterDto>();
  @Input() isOpen = false;
  @Input() data: SaleManagerFilterDto | undefined;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.filterSaleManager.init(this.data!);
  }

  onDismiss() {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onFilterClick() {
    this.saleMangerFilterClick.emit(this.filterSaleManager);
    this.onDismiss();
  }

  statusSelectionChange(item: string) {
    if (item === dictionary.Clear) {
      this.filterSaleManager.isActive = undefined;
    }
  }
}
