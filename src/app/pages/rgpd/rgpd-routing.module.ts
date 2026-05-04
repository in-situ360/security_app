import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RGPDPage } from './rgpd.page';

const routes: Routes = [
  {
    path: '',
    component: RGPDPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RGPDPageRoutingModule {}
