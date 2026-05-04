import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InteriorChatPage } from './interior-chat.page';

const routes: Routes = [
  {
    path: '',
    component: InteriorChatPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InteriorChatPageRoutingModule {}
