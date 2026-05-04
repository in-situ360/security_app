import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PnchatsPage } from './pnchats.page';

const routes: Routes = [
  {
    path: '',
    component: PnchatsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PnchatsPageRoutingModule {}
