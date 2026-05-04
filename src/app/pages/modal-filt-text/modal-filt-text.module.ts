import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalFiltTextPageRoutingModule } from './modal-filt-text-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { ModalFiltTextPage } from './modal-filt-text.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ModalFiltTextPageRoutingModule
  ],
  declarations: [ModalFiltTextPage]
})
export class ModalFiltTextPageModule {}
