import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InteriorPgchatPageRoutingModule } from './interior-pgchat-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import { InteriorPgchatPage } from './interior-pgchat.page';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    InteriorPgchatPageRoutingModule,
    ComponentsModule
  ],
  declarations: [InteriorPgchatPage]
})
export class InteriorPgchatPageModule {}
