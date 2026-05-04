import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InteriorChatPageRoutingModule } from './interior-chat-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { InteriorChatPage } from './interior-chat.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    InteriorChatPageRoutingModule,
    ComponentsModule
  ],
  declarations: [InteriorChatPage]
})
export class InteriorChatPageModule {}
