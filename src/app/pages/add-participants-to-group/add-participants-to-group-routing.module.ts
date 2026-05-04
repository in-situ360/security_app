import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddParticipantsToGroupPage } from './add-participants-to-group.page';

const routes: Routes = [
  {
    path: '',
    component: AddParticipantsToGroupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddParticipantsToGroupPageRoutingModule {}
