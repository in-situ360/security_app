import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OtherUserPage } from './other-user.page';

const routes: Routes = [
  {
    path: '',
    component: OtherUserPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OtherUserPageRoutingModule {}
