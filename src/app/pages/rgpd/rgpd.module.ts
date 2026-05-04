import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RGPDPageRoutingModule } from './rgpd-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import {PdfViewerModule} from 'ng2-pdf-viewer';

import { RGPDPage } from './rgpd.page';

@NgModule({
  imports: [
    CommonModule,
    PdfViewerModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    RGPDPageRoutingModule
  ],
  declarations: [RGPDPage]
})
export class RGPDPageModule {}
