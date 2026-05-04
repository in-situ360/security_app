import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { IonicModule } from '@ionic/angular';

import { EditParticipantsPageRoutingModule } from './edit-participants-routing.module';

import { EditParticipantsPage } from './edit-participants.page';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TranslateModule,
    EditParticipantsPageRoutingModule
  ],
  declarations: [EditParticipantsPage]
})
export class EditParticipantsPageModule {}
