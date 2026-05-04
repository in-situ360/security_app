import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsersFollowModalPage } from './users-follow-modal.page';

const routes: Routes = [
  {
    path: '',
    component: UsersFollowModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersFollowModalPageRoutingModule {}
