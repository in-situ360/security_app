import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailProjectPageRoutingModule } from './detail-project-routing.module';

import { DetailProjectPage } from './detail-project.page';

import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    DetailProjectPageRoutingModule
  ],
  declarations: [DetailProjectPage]
})
export class DetailProjectPageModule {}
