import { Component, OnDestroy } from "@angular/core";
import { TagService } from "@app/core/services";
import { CustomerService } from "../../service/customer.service";

@Component({
  selector: "app-financial-activities-tab",
  templateUrl: "./financial-activities-tab.component.html",
  styleUrls: ["./financial-activities-tab.component.scss"],
})
export class FinancialActivitiesComponent implements OnDestroy {
  customerId: number | undefined;

  constructor(
    private customerService: CustomerService,
    private tagService: TagService
  ) {
    this.customerId = this.customerService.branch?.merchantId;
  }

  ngOnDestroy(): void {
    this.tagService.tagList = [];
  }
}
