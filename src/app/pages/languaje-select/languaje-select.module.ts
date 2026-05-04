import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LanguajeSelectPageRoutingModule } from './languaje-select-routing.module';

import { LanguajeSelectPage } from './languaje-select.page';

import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule, //MULTI LENGUAJE
    LanguajeSelectPageRoutingModule
  ],
  declarations: [LanguajeSelectPage]
})
export class LanguajeSelectPageModule {}
