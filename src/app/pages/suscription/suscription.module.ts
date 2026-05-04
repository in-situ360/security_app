import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SuscriptionPageRoutingModule } from './suscription-routing.module';

import { SuscriptionPage } from './suscription.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    SuscriptionPageRoutingModule
  ],
  declarations: [SuscriptionPage]
})
export class SuscriptionPageModule {}
