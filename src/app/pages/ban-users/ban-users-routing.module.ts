import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BanUsersPage } from './ban-users.page';

const routes: Routes = [
  {
    path: '',
    component: BanUsersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BanUsersPageRoutingModule {}
