import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InvitadoModalPageRoutingModule } from './invitado-modal-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { InvitadoModalPage } from './invitado-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    InvitadoModalPageRoutingModule
  ],
  declarations: [InvitadoModalPage]
})
export class InvitadoModalPageModule {}
