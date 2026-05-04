import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditParticipantsPage } from './edit-participants.page';

const routes: Routes = [
  {
    path: '',
    component: EditParticipantsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditParticipantsPageRoutingModule {}
