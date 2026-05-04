import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GroupChatDetailPageRoutingModule } from './group-chat-detail-routing.module';

import { GroupChatDetailPage } from './group-chat-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GroupChatDetailPageRoutingModule
  ],
  declarations: [GroupChatDetailPage]
})
export class GroupChatDetailPageModule {}
