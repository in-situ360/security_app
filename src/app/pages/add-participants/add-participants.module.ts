import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddParticipantsPageRoutingModule } from './add-participants-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { AddParticipantsPage } from './add-participants.page';

import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TranslateModule,
    AddParticipantsPageRoutingModule
  ],
  declarations: [AddParticipantsPage]
})
export class AddParticipantsPageModule {}
