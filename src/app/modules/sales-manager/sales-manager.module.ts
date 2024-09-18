import { NgModule } from "@angular/core";
import { CoreModule } from "@app/core/core.module";
import { BranchesClient, SaleManagersClient, TeamClient } from "@app/proxy/proxy";
import { SharedModule } from "@app/shared/shared.module";
import { AssignedCustomersTabComponent } from "./component/assigned-customers-tab/assigned-customers-tab.component";
import { ChooseCustomerComponent } from "./component/choose-customer/choose-customer.component";
import { EditModalComponent } from "./component/edit-modal/edit-modal.component";
import { InfoComponent } from "./component/info/info.component";
import { NewModalComponent } from "./component/new-modal/new-modal.component";
import { ReportCustomersComponent } from "./component/report-customers/report-customers.component";
import { SaleMangerFilterComponent } from "./component/sale-manger-filter/sale-manger-filter.component";
import { SalesManagerModuleRoutingModule } from "./sales-manager.routing.module";
import { DetailComponent } from "./view/detail/detail.component";
import { ListComponent } from "./view/list/list.component";
import { ReportsFilterComponent } from "./component/reports-filter/reports-filter.component";

@NgModule({
  declarations: [
    ListComponent,
    NewModalComponent,
    DetailComponent,
    AssignedCustomersTabComponent,
    InfoComponent,
    ChooseCustomerComponent,
    EditModalComponent,
    SaleMangerFilterComponent,
    ReportCustomersComponent,
    ReportsFilterComponent
  ],
  imports: [SalesManagerModuleRoutingModule, SharedModule, CoreModule],
  providers: [BranchesClient, SaleManagersClient, TeamClient]
})
export class SalesManagerModule { }
