import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FinishProfilePage } from './finish-profile.page';

const routes: Routes = [
  {
    path: '',
    component: FinishProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinishProfilePageRoutingModule {}
