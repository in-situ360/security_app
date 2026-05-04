import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UploadAdvertisementPageRoutingModule } from './upload-advertisement-routing.module';

import { UploadAdvertisementPage } from './upload-advertisement.page';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    UploadAdvertisementPageRoutingModule
  ],
  declarations: [UploadAdvertisementPage]
})
export class UploadAdvertisementPageModule {}
