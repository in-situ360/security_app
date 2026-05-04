import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CoverPagePageRoutingModule } from './cover-page-routing.module';

import { CoverPagePage } from './cover-page.page';

import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    CoverPagePageRoutingModule
  ],
  declarations: [CoverPagePage]
})
export class CoverPagePageModule {}
