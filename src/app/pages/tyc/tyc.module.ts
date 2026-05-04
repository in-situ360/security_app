import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TYCPageRoutingModule } from './tyc-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import {PdfViewerModule} from 'ng2-pdf-viewer';

import { TYCPage } from './tyc.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PdfViewerModule,
    IonicModule,
    TranslateModule,
    TYCPageRoutingModule
  ],
  declarations: [TYCPage]
})
export class TYCPageModule {}
