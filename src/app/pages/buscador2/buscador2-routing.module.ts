import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Buscador2Page } from './buscador2.page';

const routes: Routes = [
  {
    path: '',
    component: Buscador2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Buscador2PageRoutingModule {}
