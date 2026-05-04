import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SuscriptionDetailPage } from './suscription-detail.page';

const routes: Routes = [
  {
    path: '',
    component: SuscriptionDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuscriptionDetailPageRoutingModule {}
