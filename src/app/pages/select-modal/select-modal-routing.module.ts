import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectModalPage } from './select-modal.page';

const routes: Routes = [
  {
    path: '',
    component: SelectModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectModalPageRoutingModule {}
