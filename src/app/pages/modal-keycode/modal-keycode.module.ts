import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalKeycodePageRoutingModule } from './modal-keycode-routing.module';

import { ModalKeycodePage } from './modal-keycode.page';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    ModalKeycodePageRoutingModule
  ],
  declarations: [ModalKeycodePage]
})
export class ModalKeycodePageModule {}
