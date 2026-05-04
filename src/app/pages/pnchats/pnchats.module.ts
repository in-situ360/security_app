import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PnchatsPageRoutingModule } from './pnchats-routing.module';

import { PnchatsPage } from './pnchats.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TranslateModule,
    PnchatsPageRoutingModule
  ],
  declarations: [PnchatsPage]
})
export class PnchatsPageModule {}
