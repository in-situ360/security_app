import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectUseroptionsModalPageRoutingModule } from './select-useroptions-modal-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { SelectUseroptionsModalPage } from './select-useroptions-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    SelectUseroptionsModalPageRoutingModule
  ],
  declarations: [SelectUseroptionsModalPage]
})
export class SelectUseroptionsModalPageModule {}
