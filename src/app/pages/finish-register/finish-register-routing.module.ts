import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FinishRegisterPage } from './finish-register.page'; 

const routes: Routes = [
  {
    path: '',
    component: FinishRegisterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinishRegisterPageRoutingModule {}
