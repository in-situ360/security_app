import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VirtualAssistantPage } from './virtual-assistant.page';

const routes: Routes = [
  {
    path: '',
    component: VirtualAssistantPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VirtualAssistantPageRoutingModule {}
