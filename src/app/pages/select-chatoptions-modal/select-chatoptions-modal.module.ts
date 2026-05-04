import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectChatoptionsModalPageRoutingModule } from './select-chatoptions-modal-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { SelectChatoptionsModalPage } from './select-chatoptions-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    SelectChatoptionsModalPageRoutingModule
  ],
  declarations: [SelectChatoptionsModalPage]
})
export class SelectChatoptionsModalPageModule {}
