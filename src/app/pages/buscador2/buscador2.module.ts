import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { IonicModule } from '@ionic/angular';

import { Buscador2PageRoutingModule } from './buscador2-routing.module';

import { Buscador2Page } from './buscador2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    Buscador2PageRoutingModule
  ],
  declarations: [Buscador2Page]
})
export class Buscador2PageModule {}
