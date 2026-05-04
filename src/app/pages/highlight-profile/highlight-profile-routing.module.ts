import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HighlightProfilePage } from './highlight-profile.page';

const routes: Routes = [
  {
    path: '',
    component: HighlightProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HighlightProfilePageRoutingModule {}
