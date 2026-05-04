import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InteriorPnchatPageRoutingModule } from './interior-pnchat-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import { InteriorPnchatPage } from './interior-pnchat.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    InteriorPnchatPageRoutingModule,
    ComponentsModule
  ],
  declarations: [InteriorPnchatPage]
})
export class InteriorPnchatPageModule {}
