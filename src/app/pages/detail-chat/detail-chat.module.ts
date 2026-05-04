import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailChatPageRoutingModule } from './detail-chat-routing.module';

import { DetailChatPage } from './detail-chat.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailChatPageRoutingModule
  ],
  declarations: [DetailChatPage]
})
export class DetailChatPageModule {}
