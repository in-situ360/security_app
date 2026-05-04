import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ParticipatsPermissionsListPageRoutingModule } from './participats-permissions-list-routing.module';

import { ParticipatsPermissionsListPage } from './participats-permissions-list.page';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ParticipatsPermissionsListPageRoutingModule
  ],
  declarations: [ParticipatsPermissionsListPage]
})
export class ParticipatsPermissionsListPageModule {}
