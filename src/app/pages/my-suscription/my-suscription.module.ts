import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MySuscriptionPageRoutingModule } from './my-suscription-routing.module';

import { MySuscriptionPage } from './my-suscription.page';

import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    MySuscriptionPageRoutingModule
  ],
  declarations: [MySuscriptionPage]
})
export class MySuscriptionPageModule {}
