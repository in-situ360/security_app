import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GrantPermissionsPageRoutingModule } from './grant-permissions-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import { GrantPermissionsPage } from './grant-permissions.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    IonicModule,
    GrantPermissionsPageRoutingModule
  ],
  declarations: [GrantPermissionsPage]
})
export class GrantPermissionsPageModule {}
