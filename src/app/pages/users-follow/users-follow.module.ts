import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsersFollowPageRoutingModule } from './users-follow-routing.module';

import { UsersFollowPage } from './users-follow.page';

import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    IonicModule,
    UsersFollowPageRoutingModule
  ],
  declarations: [UsersFollowPage]
})
export class UsersFollowPageModule {}
