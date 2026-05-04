import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { UsersetagsPageRoutingModule } from './usersetags-routing.module';

import { UsersetagsPage } from './usersetags.page';

import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    UsersetagsPageRoutingModule,
    TranslateModule
    
  ],
  declarations: [UsersetagsPage]
})
export class UsersetagsPageModule {}
