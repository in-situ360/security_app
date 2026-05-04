import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalBillingPdfPage } from './modal-billing-pdf.page';

const routes: Routes = [
  {
    path: '',
    component: ModalBillingPdfPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalBillingPdfPageRoutingModule {}
