import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreatePnchatModalPage } from './create-pnchat-modal.page';

const routes: Routes = [
  {
    path: '',
    component: CreatePnchatModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreatePnchatModalPageRoutingModule {}
