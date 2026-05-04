import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalBillingPdfPageRoutingModule } from './modal-billing-pdf-routing.module';

import { ModalBillingPdfPage } from './modal-billing-pdf.page';

import {PdfViewerModule} from 'ng2-pdf-viewer';
import { PinchZoomModule } from '@mtnair/ngx-pinch-zoom';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PdfViewerModule,
    TranslateModule,
    PinchZoomModule,
    ModalBillingPdfPageRoutingModule
  ],
  declarations: [ModalBillingPdfPage]
})
export class ModalBillingPdfPageModule {}
