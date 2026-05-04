import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SplashModalPage } from './splash-modal.page';

const routes: Routes = [
  {
    path: '',
    component: SplashModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SplashModalPageRoutingModule {}
