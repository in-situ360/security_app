import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectUseroptionsModalPage } from './select-useroptions-modal.page';

const routes: Routes = [
  {
    path: '',
    component: SelectUseroptionsModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectUseroptionsModalPageRoutingModule {}
