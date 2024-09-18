import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PostPaidComponent } from "./view/post-paid/post-paid.component";

const routes: Routes = [
  {
    path: "",
    component: PostPaidComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostPaidRoutingModule {}
