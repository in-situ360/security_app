import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SuscriptionPage } from './suscription.page';

const routes: Routes = [
  {
    path: '',
    component: SuscriptionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuscriptionPageRoutingModule {}
