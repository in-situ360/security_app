import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalMenuProjectPage } from './modal-menu-project.page';

const routes: Routes = [
  {
    path: '',
    component: ModalMenuProjectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalMenuProjectPageRoutingModule {}
