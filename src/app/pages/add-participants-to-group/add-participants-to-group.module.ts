import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { IonicModule } from '@ionic/angular';

import { AddParticipantsToGroupPageRoutingModule } from './add-participants-to-group-routing.module';

import { AddParticipantsToGroupPage } from './add-participants-to-group.page';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ComponentsModule,
    AddParticipantsToGroupPageRoutingModule
  ],
  declarations: [AddParticipantsToGroupPage]
})
export class AddParticipantsToGroupPageModule {}
