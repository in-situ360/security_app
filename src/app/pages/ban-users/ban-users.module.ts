import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BanUsersPageRoutingModule } from './ban-users-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import { BanUsersPage } from './ban-users.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    BanUsersPageRoutingModule
  ],
  declarations: [BanUsersPage]
})
export class BanUsersPageModule {}
