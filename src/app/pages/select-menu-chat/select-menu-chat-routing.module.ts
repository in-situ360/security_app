import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectMenuChatPage } from './select-menu-chat.page';

const routes: Routes = [
  {
    path: '',
    component: SelectMenuChatPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectMenuChatPageRoutingModule {}
