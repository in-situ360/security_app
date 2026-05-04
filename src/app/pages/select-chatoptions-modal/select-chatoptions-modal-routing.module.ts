import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectChatoptionsModalPage } from './select-chatoptions-modal.page';

const routes: Routes = [
  {
    path: '',
    component: SelectChatoptionsModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectChatoptionsModalPageRoutingModule {}
