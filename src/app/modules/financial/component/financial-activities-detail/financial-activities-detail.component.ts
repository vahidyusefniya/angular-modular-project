import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CoreService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { Branch, FinancialOrder } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-financial-activities-detail",
  templateUrl: "./financial-activities-detail.component.html",
  styleUrls: ["./financial-activities-detail.component.scss"],
})
export class FinancialActivitiesDetailComponent {
  dictionary = dictionary;
  branchId: number | undefined;
  branch: Branch;

  @Input() isOpen = false;
  @Input() financialActivity: FinancialOrder | undefined;
  @Output() dismiss = new EventEmitter();
  @Output() submit = new EventEmitter();

  constructor(
    private modalCtrl: ModalController,
    private coreService: CoreService,
    private layoutService: LayoutService
  ) {
    this.branchId = this.coreService.getBranchId()!;
    this.branch = this.layoutService.getBranch(this.branchId)!;
  }

  onDismiss(): void {
    this.modalCtrl.dismiss();
    this.dismiss.emit();
  }
}
