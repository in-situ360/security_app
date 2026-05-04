import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetailProyectPage } from './detail-proyect.page';

const routes: Routes = [
  {
    path: '',
    component: DetailProyectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetailProyectPageRoutingModule {}
