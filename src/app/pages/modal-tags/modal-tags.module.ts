import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalTagsPageRoutingModule } from './modal-tags-routing.module';

import { ModalTagsPage } from './modal-tags.page';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ModalTagsPageRoutingModule
  ],
  declarations: [ModalTagsPage]
})
export class ModalTagsPageModule {}
