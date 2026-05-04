import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectMenuChatPageRoutingModule } from './select-menu-chat-routing.module';

import { SelectMenuChatPage } from './select-menu-chat.page';


import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    SelectMenuChatPageRoutingModule
  ],
  declarations: [SelectMenuChatPage]
})
export class SelectMenuChatPageModule {}
