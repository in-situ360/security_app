import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalBillingDataPageRoutingModule } from './modal-billing-data-routing.module';

import { ModalBillingDataPage } from './modal-billing-data.page';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,    
    IonicModule,
    TranslateModule,
    ComponentsModule,
    ModalBillingDataPageRoutingModule
  ],
  declarations: [ModalBillingDataPage]
})
export class ModalBillingDataPageModule {}
