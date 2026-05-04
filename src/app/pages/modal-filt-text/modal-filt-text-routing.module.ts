import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalFiltTextPage } from './modal-filt-text.page';

const routes: Routes = [
  {
    path: '',
    component: ModalFiltTextPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalFiltTextPageRoutingModule {}
