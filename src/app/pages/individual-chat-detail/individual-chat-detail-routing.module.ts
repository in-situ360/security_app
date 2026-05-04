import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndividualChatDetailPage } from './individual-chat-detail.page';

const routes: Routes = [
  {
    path: '',
    component: IndividualChatDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IndividualChatDetailPageRoutingModule {}
