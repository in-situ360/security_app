import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JobImageCropperPageRoutingModule } from './job-image-cropper-routing.module';

import { JobImageCropperPage } from './job-image-cropper.page';



import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { ComponentsModule } from 'src/app/components/components.module';
import { ImageCropperModule } from 'ngx-image-cropper';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TranslateModule,
    ImageCropperModule,
    JobImageCropperPageRoutingModule
  ],
  declarations: [JobImageCropperPage]
})
export class JobImageCropperPageModule {}
