import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyBillingsPage } from './my-billings.page';

const routes: Routes = [
  {
    path: '',
    component: MyBillingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyBillingsPageRoutingModule {}
