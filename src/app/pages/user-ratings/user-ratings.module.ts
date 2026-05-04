import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserRatingsPageRoutingModule } from './user-ratings-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { UserRatingsPage } from './user-ratings.page';


import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ComponentsModule,
    UserRatingsPageRoutingModule
  ],
  declarations: [UserRatingsPage]
})
export class UserRatingsPageModule {}
