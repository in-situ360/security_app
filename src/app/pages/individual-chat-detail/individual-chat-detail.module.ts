import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IndividualChatDetailPageRoutingModule } from './individual-chat-detail-routing.module';

import { IndividualChatDetailPage } from './individual-chat-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IndividualChatDetailPageRoutingModule
  ],
  declarations: [IndividualChatDetailPage]
})
export class IndividualChatDetailPageModule {}
