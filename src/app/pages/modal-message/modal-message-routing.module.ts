import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalMessagePage } from './modal-message.page';

const routes: Routes = [
  {
    path: '',
    component: ModalMessagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalMessagePageRoutingModule {}
