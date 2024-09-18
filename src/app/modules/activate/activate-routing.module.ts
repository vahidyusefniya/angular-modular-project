import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ActivateViewComponent } from "./view/activate-view/activate-view.component";

const routes: Routes = [
  {
    path: "",
    component: ActivateViewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivateRoutingModule { }
