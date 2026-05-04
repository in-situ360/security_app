import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UploadAdvertisementPage } from './upload-advertisement.page';

const routes: Routes = [
  {
    path: '',
    component: UploadAdvertisementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UploadAdvertisementPageRoutingModule {}
