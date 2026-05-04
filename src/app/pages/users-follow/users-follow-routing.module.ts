import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsersFollowPage } from './users-follow.page';

const routes: Routes = [
  {
    path: '',
    component: UsersFollowPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersFollowPageRoutingModule {}
