import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalTagsPage } from './modal-tags.page';

const routes: Routes = [
  {
    path: '',
    component: ModalTagsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalTagsPageRoutingModule {}
