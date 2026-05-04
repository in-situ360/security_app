import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { AddRatingPageRoutingModule } from './add-rating-routing.module';

import { AddRatingPage } from './add-rating.page';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    ComponentsModule,
    AddRatingPageRoutingModule
  ],
  declarations: [AddRatingPage]
})
export class AddRatingPageModule {}
