import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetailProjectPage } from './detail-project.page';

const routes: Routes = [
  {
    path: '',
    component: DetailProjectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetailProjectPageRoutingModule {}
