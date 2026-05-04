import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FAQPageRoutingModule } from './faq-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { FAQPage } from './faq.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    FAQPageRoutingModule
  ],
  declarations: [FAQPage]
})
export class FAQPageModule {}
