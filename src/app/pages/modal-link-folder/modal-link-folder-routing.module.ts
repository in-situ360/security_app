import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalLinkFolderPage } from './modal-link-folder.page';

const routes: Routes = [
  {
    path: '',
    component: ModalLinkFolderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalLinkFolderPageRoutingModule {}
