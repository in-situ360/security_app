import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectFolderoptionsModalPage } from './select-folderoptions-modal.page';

const routes: Routes = [
  {
    path: '',
    component: SelectFolderoptionsModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectFolderoptionsModalPageRoutingModule {}
