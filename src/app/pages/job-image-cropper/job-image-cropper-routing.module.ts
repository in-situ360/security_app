import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JobImageCropperPage } from './job-image-cropper.page';

const routes: Routes = [
  {
    path: '',
    component: JobImageCropperPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobImageCropperPageRoutingModule {}
