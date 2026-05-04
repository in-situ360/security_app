import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SuscriptionCheckoutPageRoutingModule } from './suscription-checkout-routing.module';

import { SuscriptionCheckoutPage } from './suscription-checkout.page';

import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    SuscriptionCheckoutPageRoutingModule
  ],
  declarations: [SuscriptionCheckoutPage]
})
export class SuscriptionCheckoutPageModule {}
