import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ParticipatsPermissionsListPage } from './participats-permissions-list.page';

const routes: Routes = [
  {
    path: '',
    component: ParticipatsPermissionsListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ParticipatsPermissionsListPageRoutingModule {}
