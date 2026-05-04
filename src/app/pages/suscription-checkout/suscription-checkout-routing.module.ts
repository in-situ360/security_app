import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SuscriptionCheckoutPage } from './suscription-checkout.page';

const routes: Routes = [
  {
    path: '',
    component: SuscriptionCheckoutPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuscriptionCheckoutPageRoutingModule {}
