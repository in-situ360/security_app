import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { DetailProyectPageRoutingModule } from './detail-proyect-routing.module';

import { DetailProyectPage } from './detail-proyect.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    DetailProyectPageRoutingModule
  ],
  declarations: [DetailProyectPage]
})
export class DetailProyectPageModule {}
