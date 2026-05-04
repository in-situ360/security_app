import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InteriorPnchatPage } from './interior-pnchat.page';

const routes: Routes = [
  {
    path: '',
    component: InteriorPnchatPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InteriorPnchatPageRoutingModule {}
