import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RatingModalPageRoutingModule } from './rating-modal-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { RatingModalPage } from './rating-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    RatingModalPageRoutingModule
  ],
  declarations: [RatingModalPage]
})
export class RatingModalPageModule {}
