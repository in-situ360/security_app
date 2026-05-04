import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SplashModalPageRoutingModule } from './splash-modal-routing.module';

import { SplashModalPage } from './splash-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SplashModalPageRoutingModule
  ],
  declarations: [SplashModalPage]
})
export class SplashModalPageModule {}
