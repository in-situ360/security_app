import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BuscadorPageRoutingModule } from './buscador-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { BuscadorPage } from './buscador.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    BuscadorPageRoutingModule
  ],
  declarations: [BuscadorPage]
})
export class BuscadorPageModule {}
