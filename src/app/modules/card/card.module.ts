import { NgModule } from "@angular/core";

import { CardRoutingModule } from "./card-routing.module";
import { CardComponent } from "./view/card.component";
import { SharedModule } from "@app/shared/shared.module";

@NgModule({
  declarations: [CardComponent],
  imports: [SharedModule, CardRoutingModule],
})
export class CardModule {}
