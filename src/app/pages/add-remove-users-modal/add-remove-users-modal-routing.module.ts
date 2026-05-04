import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddRemoveUsersModalPage } from './add-remove-users-modal.page';

const routes: Routes = [
  {
    path: '',
    component: AddRemoveUsersModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddRemoveUsersModalPageRoutingModule {}
