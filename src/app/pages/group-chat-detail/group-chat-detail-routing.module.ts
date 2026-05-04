import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GroupChatDetailPage } from './group-chat-detail.page';

const routes: Routes = [
  {
    path: '',
    component: GroupChatDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GroupChatDetailPageRoutingModule {}
