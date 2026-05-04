import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalBillingDataPage } from './modal-billing-data.page';

const routes: Routes = [
  {
    path: '',
    component: ModalBillingDataPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalBillingDataPageRoutingModule {}
