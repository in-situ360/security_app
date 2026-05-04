import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProjectCheckoutPage } from './project-checkout.page';

const routes: Routes = [
  {
    path: '',
    component: ProjectCheckoutPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectCheckoutPageRoutingModule {}
