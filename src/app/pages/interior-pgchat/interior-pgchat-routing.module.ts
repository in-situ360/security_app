import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InteriorPgchatPage } from './interior-pgchat.page';

const routes: Routes = [
  {
    path: '',
    component: InteriorPgchatPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InteriorPgchatPageRoutingModule {}
