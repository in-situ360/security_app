import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewFolderContentPage } from './new-folder-content.page';

const routes: Routes = [
  {
    path: '',
    component: NewFolderContentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewFolderContentPageRoutingModule {}
