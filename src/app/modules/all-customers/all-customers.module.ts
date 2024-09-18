import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CoreModule } from '@app/core/core.module';
import { MerchantsClient, SystemClient } from '@app/proxy/proxy';
import { SharedModule } from '@app/shared/shared.module';
import { AllCustomersRoutingModule } from './all-customers-routing.module';
import { AllCustomersListComponent } from './view/all-customers-list/all-customers-list.component';


@NgModule({
  declarations: [
    AllCustomersListComponent
  ],
  imports: [
    CommonModule,
    AllCustomersRoutingModule,
    SharedModule,
    CoreModule,
  ],
  providers: [
    MerchantsClient,
    SystemClient
  ]
})
export class AllCustomersModule { }
