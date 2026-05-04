import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectAdvertisementoptionsModalPage } from './select-advertisementoptions-modal.page';

const routes: Routes = [
  {
    path: '',
    component: SelectAdvertisementoptionsModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectAdvertisementoptionsModalPageRoutingModule {}
