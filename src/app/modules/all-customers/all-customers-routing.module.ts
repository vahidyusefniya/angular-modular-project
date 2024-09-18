import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllCustomersListComponent } from './view/all-customers-list/all-customers-list.component';

const routes: Routes = [
  {
    path: "",
    component: AllCustomersListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllCustomersRoutingModule { }
