import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ForbiddenComponent } from "./view/forbidden/forbidden.component";

const routes: Routes = [
  {
    path: "",
    component: ForbiddenComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ForbiddenRoutingModule {}
RouterModule.forRoot(routes, { useHash: false });
