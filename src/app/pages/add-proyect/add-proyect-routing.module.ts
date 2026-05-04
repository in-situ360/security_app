import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddProyectPage } from './add-proyect.page';

const routes: Routes = [
  {
    path: '',
    component: AddProyectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddProyectPageRoutingModule {}
