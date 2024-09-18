import { NgModule } from "@angular/core";
import { CoreModule } from "@core/core.module";
import { SharedModule } from "@shared/shared.module";
import { BranchRoutingModule } from "./branch.routing.module";
import { NewBranchComponent } from "./component/new-branch/new-branch.component";
import { BranchListComponent } from "./view/branch-list/branch-list.component";
import { AssignPriceListComponent } from "./component/assign-price-list/assign-price-list.component";
import { PriceListsClient } from "@app/proxy/proxy";

@NgModule({
  declarations: [
    BranchListComponent,
    NewBranchComponent,
    AssignPriceListComponent,
  ],
  imports: [BranchRoutingModule, SharedModule, CoreModule],
  providers: [PriceListsClient],
})
export class BranchModule {}
