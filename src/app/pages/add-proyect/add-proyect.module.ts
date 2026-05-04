import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { IonicModule } from '@ionic/angular';

import { AddProyectPageRoutingModule } from './add-proyect-routing.module';

import { AddProyectPage } from './add-proyect.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    AddProyectPageRoutingModule
  ],
  declarations: [AddProyectPage]
})
export class AddProyectPageModule {}
