import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalRequestPermissionsPageRoutingModule } from './modal-request-permissions-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import { ModalRequestPermissionsPage } from './modal-request-permissions.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
     TranslateModule,
    ModalRequestPermissionsPageRoutingModule
  ],
  declarations: [ModalRequestPermissionsPage]
})
export class ModalRequestPermissionsPageModule {}
