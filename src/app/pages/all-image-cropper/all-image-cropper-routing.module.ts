import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AllImageCropperPage } from './all-image-cropper.page';

const routes: Routes = [
  {
    path: '',
    component: AllImageCropperPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AllImageCropperPageRoutingModule {}
