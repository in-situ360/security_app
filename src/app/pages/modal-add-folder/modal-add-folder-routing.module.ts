import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalAddFolderPage } from './modal-add-folder.page';

const routes: Routes = [
  {
    path: '',
    component: ModalAddFolderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalAddFolderPageRoutingModule {}
