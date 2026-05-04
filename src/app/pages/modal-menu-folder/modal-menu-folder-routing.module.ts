import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalMenuFolderPage } from './modal-menu-folder.page';

const routes: Routes = [
  {
    path: '',
    component: ModalMenuFolderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalMenuFolderPageRoutingModule {}
