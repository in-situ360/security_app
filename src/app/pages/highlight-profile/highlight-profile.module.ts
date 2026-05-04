import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HighlightProfilePageRoutingModule } from './highlight-profile-routing.module';

import { HighlightProfilePage } from './highlight-profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HighlightProfilePageRoutingModule
  ],
  declarations: [HighlightProfilePage]
})
export class HighlightProfilePageModule {}
