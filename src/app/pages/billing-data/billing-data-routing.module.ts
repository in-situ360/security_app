import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BillingDataPage } from './billing-data.page';

const routes: Routes = [
  {
    path: '',
    component: BillingDataPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillingDataPageRoutingModule {}
