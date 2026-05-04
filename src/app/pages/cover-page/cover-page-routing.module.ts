import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CoverPagePage } from './cover-page.page';

const routes: Routes = [
  {
    path: '',
    component: CoverPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoverPagePageRoutingModule {}
