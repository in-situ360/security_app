import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { AllImageCropperPageRoutingModule } from './all-image-cropper-routing.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { AllImageCropperPage } from './all-image-cropper.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ImageCropperModule,
    AllImageCropperPageRoutingModule
  ],
  declarations: [AllImageCropperPage]
})
export class AllImageCropperPageModule {}
