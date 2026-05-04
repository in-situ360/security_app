import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LanguajeSelectPage } from './languaje-select.page';

const routes: Routes = [
  {
    path: '',
    component: LanguajeSelectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LanguajeSelectPageRoutingModule {}
