import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";
import { BranchPostPayInvoiceFilterDto } from "../../dto/customer.dto";
import { Branch } from "@app/proxy/proxy";
import { TagService } from "@app/core/services";

@Component({
  selector: "app-postpaid-filter-modal",
  templateUrl: "./postpaid-filter-modal.component.html",
  styleUrls: ["./postpaid-filter-modal.component.scss"],
})
export class PostpaidFilterModalComponent implements OnInit {
  dictionary = dictionary;
  filter = new BranchPostPayInvoiceFilterDto();
  maxDate = new Date().toISOString();
  @Input() customers: Branch[] = [];
  @Input() isOpen = false;
  @Input() data: BranchPostPayInvoiceFilterDto | undefined;

  @Output() branchPostPayInvoiceFilter =
    new EventEmitter<BranchPostPayInvoiceFilterDto>();
  @Output() dismiss = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private tagService: TagService
  ) {}

  ngOnInit(): void {
    if (this.data) this.filter.init(this.data);
  }

  customerSelectionChange(data: number | string): void {
    if (typeof data === "string") this.filter.merchantId = undefined;
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }

  onFilterClick(): void {
    if (!this.filter.merchantId) {
      this.tagService.removeTag(dictionary.Customer);
    }
    this.branchPostPayInvoiceFilter.emit(this.filter);
    this.modalCtrl.dismiss();
  }
}
