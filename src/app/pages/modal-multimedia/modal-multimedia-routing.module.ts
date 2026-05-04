import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalMultimediaPage } from './modal-multimedia.page';

const routes: Routes = [
  {
    path: '',
    component: ModalMultimediaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalMultimediaPageRoutingModule {}
