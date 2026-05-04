import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RangePriceModalPageRoutingModule } from './range-price-modal-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { RangePriceModalPage } from './range-price-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    RangePriceModalPageRoutingModule
  ],
  declarations: [RangePriceModalPage]
})
export class RangePriceModalPageModule {}
