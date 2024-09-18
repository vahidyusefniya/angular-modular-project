import { NgModule } from "@angular/core";
import { CoreModule } from "@app/core/core.module";
import { MerchantsClient } from "@app/proxy/proxy";
import { SharedModule } from "@app/shared/shared.module";
import { CompanyConfigurationTabComponent } from "./component/company-configuration-tab/company-configuration-tab.component";
import { SecurityTabComponent } from "./component/security-tab/security-tab.component";
import { SettingsRoutingModule } from "./settings-routing.module";
import { SettingsComponent } from "./view/settings/settings.component";

@NgModule({
  declarations: [
    SettingsComponent,
    SecurityTabComponent,
    CompanyConfigurationTabComponent,
  ],
  imports: [SharedModule, CoreModule, SettingsRoutingModule],
  providers: [MerchantsClient],
})
export class SettingsModule {}
