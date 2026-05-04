import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImageCropperPageRoutingModule } from './image-cropper-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { ImageCropperPage } from './image-cropper.page';
import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ImageCropperModule,
    ImageCropperPageRoutingModule
  ],
  declarations: [ImageCropperPage]
})
export class ImageCropperPageModule {}
