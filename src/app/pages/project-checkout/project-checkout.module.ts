import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProjectCheckoutPageRoutingModule } from './project-checkout-routing.module';

import { ProjectCheckoutPage } from './project-checkout.page';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ProjectCheckoutPageRoutingModule
  ],
  declarations: [ProjectCheckoutPage]
})
export class ProjectCheckoutPageModule {}
