import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddParticipantsPage } from './add-participants.page';

const routes: Routes = [
  {
    path: '',
    component: AddParticipantsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddParticipantsPageRoutingModule {}
