import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalKeycodePage } from './modal-keycode.page';

const routes: Routes = [
  {
    path: '',
    component: ModalKeycodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalKeycodePageRoutingModule {}
