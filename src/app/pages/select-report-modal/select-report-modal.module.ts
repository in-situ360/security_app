import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectReportModalPageRoutingModule } from './select-report-modal-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { SelectReportModalPage } from './select-report-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    IonicModule,
    SelectReportModalPageRoutingModule
  ],
  declarations: [SelectReportModalPage]
})
export class SelectReportModalPageModule {}
