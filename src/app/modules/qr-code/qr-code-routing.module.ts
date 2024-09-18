import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { QrCodeViewComponent } from "./view/qr-code-view/qr-code-view.component";

const routes: Routes = [
  {
    path: "",
    component: QrCodeViewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QrCodeRoutingModule {}
