import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddRemoveUsersModalPageRoutingModule } from './add-remove-users-modal-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { AddRemoveUsersModalPage } from './add-remove-users-modal.page';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ComponentsModule,
    IonicModule,
    AddRemoveUsersModalPageRoutingModule
  ],
  declarations: [AddRemoveUsersModalPage]
})
export class AddRemoveUsersModalPageModule {}
