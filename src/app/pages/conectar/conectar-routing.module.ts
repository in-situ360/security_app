import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConectarPage } from './conectar.page';

const routes: Routes = [
  {
    path: '',
    component: ConectarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConectarPageRoutingModule {}
