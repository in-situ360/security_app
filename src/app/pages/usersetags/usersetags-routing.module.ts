import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsersetagsPage } from './usersetags.page';

const routes: Routes = [
  {
    path: '',
    component: UsersetagsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersetagsPageRoutingModule {}
