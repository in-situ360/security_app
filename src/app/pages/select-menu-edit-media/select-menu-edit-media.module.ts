import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectMenuEditMediaPageRoutingModule } from './select-menu-edit-media-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { SelectMenuEditMediaPage } from './select-menu-edit-media.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    SelectMenuEditMediaPageRoutingModule
  ],
  declarations: [SelectMenuEditMediaPage]
})
export class SelectMenuEditMediaPageModule {}
