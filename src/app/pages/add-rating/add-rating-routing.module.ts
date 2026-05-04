import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddRatingPage } from './add-rating.page';

const routes: Routes = [
  {
    path: '',
    component: AddRatingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddRatingPageRoutingModule {}
