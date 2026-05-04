import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from 'src/app/components/components.module';

import { BillingDataPageRoutingModule } from './billing-data-routing.module';
import { BillingDataPage } from './billing-data.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,    
    IonicModule,
    TranslateModule,
    ComponentsModule,
    BillingDataPageRoutingModule
  ],
  declarations: [BillingDataPage]
})
export class BillingDataPageModule {}
