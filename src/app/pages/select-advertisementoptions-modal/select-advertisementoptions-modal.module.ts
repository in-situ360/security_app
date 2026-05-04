import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectAdvertisementoptionsModalPageRoutingModule } from './select-advertisementoptions-modal-routing.module';

import { SelectAdvertisementoptionsModalPage } from './select-advertisementoptions-modal.page';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    SelectAdvertisementoptionsModalPageRoutingModule
  ],
  declarations: [SelectAdvertisementoptionsModalPage]
})
export class SelectAdvertisementoptionsModalPageModule {}
