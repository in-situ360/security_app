import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsersFollowModalPageRoutingModule } from './users-follow-modal-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { UsersFollowModalPage } from './users-follow-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    UsersFollowModalPageRoutingModule
  ],
  declarations: [UsersFollowModalPage]
})
export class UsersFollowModalPageModule {}
