import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CoreModule } from '@app/core/core.module';
import { SharedModule } from '@app/shared/shared.module';
import { ReturnOrderModalComponent } from './components/return-order-modal/return-order-modal.component';
import { ReturnOrdersRoutingModule } from './return-orders-routing.module';
import { ListComponent } from './view/list/list.component';
import { ReturnOrderFilterComponent } from './components/return-order-filter/return-order-filter.component';


@NgModule({
  declarations: [
    ListComponent,
    ReturnOrderModalComponent,
    ReturnOrderFilterComponent
  ],
  imports: [
    CommonModule,
    ReturnOrdersRoutingModule,
    SharedModule,
    CoreModule
  ]
})
export class ReturnOrdersModule { }
