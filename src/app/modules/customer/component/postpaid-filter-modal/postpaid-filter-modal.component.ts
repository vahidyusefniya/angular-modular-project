import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { BranchPostPayInvoiceFilterDto } from "../../dto/customer.dto";

@Component({
  selector: "app-postpaid-filter-modal",
  templateUrl: "./postpaid-filter-modal.component.html",
  styleUrls: ["./postpaid-filter-modal.component.scss"],
})
export class PostpaidFilterModalComponent implements OnInit {
  dictionary = dictionary;
  filter = new BranchPostPayInvoiceFilterDto();
  maxDate = new Date().toISOString();

  @Input() isOpen = false;
  @Input() data: BranchPostPayInvoiceFilterDto | undefined;

  @Output() branchPostPayInvoiceFilter =
    new EventEmitter<BranchPostPayInvoiceFilterDto>();
  @Output() dismiss = new EventEmitter();

  constructor(private modalCtrl: ModalController) {}

  ngOnInit(): void {
    if (this.data) this.filter.init(this.data);
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onFilterClick(): void {
    this.branchPostPayInvoiceFilter.emit(this.filter);
    this.modalCtrl.dismiss();
  }
}
