import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VirtualAssistantPageRoutingModule } from './virtual-assistant-routing.module';

import { VirtualAssistantPage } from './virtual-assistant.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VirtualAssistantPageRoutingModule
  ],
  declarations: [VirtualAssistantPage]
})
export class VirtualAssistantPageModule {}
