import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalMultimediaPageRoutingModule } from './modal-multimedia-routing.module';

import { ModalMultimediaPage } from './modal-multimedia.page';
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
    ModalMultimediaPageRoutingModule
  ],
  declarations: [ModalMultimediaPage]
})
export class ModalMultimediaPageModule {}
