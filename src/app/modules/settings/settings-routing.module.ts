import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { dictionary } from "@dictionary/dictionary";
import { CompanyConfigurationTabComponent } from "./component/company-configuration-tab/company-configuration-tab.component";
import { SecurityTabComponent } from "./component/security-tab/security-tab.component";
import { SettingsComponent } from "./view/settings/settings.component";

const routes: Routes = [
  {
    path: "",
    component: SettingsComponent,
    children: [
      {
        path: "security",
        component: SecurityTabComponent,
        data: {
          breadcrumb: dictionary.Security,
        },
      },
      {
        path: "company-configuration",
        component: CompanyConfigurationTabComponent,
        data: {
          breadcrumb: dictionary.CompanyConfiguration,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
