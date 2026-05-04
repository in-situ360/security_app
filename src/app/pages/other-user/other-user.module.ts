import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OtherUserPageRoutingModule } from './other-user-routing.module';

import { OtherUserPage } from './other-user.page';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    OtherUserPageRoutingModule
  ],
  declarations: [OtherUserPage]
})
export class OtherUserPageModule {}
