import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GrantPermissionsPage } from './grant-permissions.page';

const routes: Routes = [
  {
    path: '',
    component: GrantPermissionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GrantPermissionsPageRoutingModule {}
