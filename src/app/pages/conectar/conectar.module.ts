import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import { IonicModule } from '@ionic/angular';

import { ConectarPageRoutingModule } from './conectar-routing.module';

import { ConectarPage } from './conectar.page';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ComponentsModule,
    ConectarPageRoutingModule
  ],
  declarations: [ConectarPage]
})
export class ConectarPageModule {}
