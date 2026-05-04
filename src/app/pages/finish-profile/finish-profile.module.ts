import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinishProfilePageRoutingModule } from './finish-profile-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { FinishProfilePage } from './finish-profile.page';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, 
    IonicModule,
    TranslateModule,
    ComponentsModule,
    FinishProfilePageRoutingModule
    
  ],
  declarations: [FinishProfilePage]
})
export class FinishProfilePageModule {}
