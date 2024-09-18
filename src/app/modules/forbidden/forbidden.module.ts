import { NgModule } from "@angular/core";
import { SharedModule } from "@app/shared/shared.module";
import { ForbiddenRoutingModule } from "./forbidden.routing.module";
import { ForbiddenComponent } from "./view/forbidden/forbidden.component";
import { CoreModule } from "@app/core/core.module";

@NgModule({
  declarations: [ForbiddenComponent],
  imports: [SharedModule, CoreModule, ForbiddenRoutingModule],
  providers: [],
})
export class ForbiddenModule {}
