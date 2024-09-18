import { NgModule } from "@angular/core";
import { CoreModule } from "@app/core/core.module";
import { SharedModule } from "@app/shared/shared.module";
import { TeamRoutingModule } from "./team.routing.module";
import { TeamListComponent } from "./view/team-list/team-list.component";
import { TeamClient } from "@app/proxy/proxy";
import { NewMemberComponent } from "./component/new-member/new-member.component";
import { NewBotComponent } from "./component/new-bot/new-bot.component";
import { EditMemberComponent } from "./component/edit-member/edit-member.component";
import { PinModalComponent } from "./component/pin-modal/pin-modal.component";

@NgModule({
  declarations: [
    TeamListComponent,
    NewMemberComponent,
    NewBotComponent,
    EditMemberComponent,
    PinModalComponent,
  ],
  imports: [TeamRoutingModule, SharedModule, CoreModule],
  providers: [TeamClient],
})
export class TeamModule {}
