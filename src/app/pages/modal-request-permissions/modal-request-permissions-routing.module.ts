import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalRequestPermissionsPage } from './modal-request-permissions.page';

const routes: Routes = [
  {
    path: '',
    component: ModalRequestPermissionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalRequestPermissionsPageRoutingModule {}
