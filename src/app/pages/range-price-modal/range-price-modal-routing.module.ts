import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RangePriceModalPage } from './range-price-modal.page';

const routes: Routes = [
  {
    path: '',
    component: RangePriceModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RangePriceModalPageRoutingModule {}
