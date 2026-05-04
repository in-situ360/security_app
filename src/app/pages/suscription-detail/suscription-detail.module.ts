import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SuscriptionDetailPageRoutingModule } from './suscription-detail-routing.module';

import { SuscriptionDetailPage } from './suscription-detail.page';

import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    SuscriptionDetailPageRoutingModule
  ],
  declarations: [SuscriptionDetailPage]
})
export class SuscriptionDetailPageModule {}
