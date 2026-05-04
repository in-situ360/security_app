import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InvitadoModalPage } from './invitado-modal.page';

const routes: Routes = [
  {
    path: '',
    component: InvitadoModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvitadoModalPageRoutingModule {}
