import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyBillingsPageRoutingModule } from './my-billings-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import { MyBillingsPage } from './my-billings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    MyBillingsPageRoutingModule
  ],
  declarations: [MyBillingsPage]
})
export class MyBillingsPageModule {}
