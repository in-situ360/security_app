import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LanguagesPageRoutingModule } from './languages-routing.module';

import { LanguagesPage } from './languages.page';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, 
    IonicModule,
    TranslateModule,
    ComponentsModule,
    LanguagesPageRoutingModule
  ],
  declarations: [LanguagesPage]
})
export class LanguagesPageModule {}
