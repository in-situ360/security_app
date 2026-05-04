import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SocialNetworksPageRoutingModule } from './social-networks-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { SocialNetworksPage } from './social-networks.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, 
    IonicModule,
    TranslateModule,
    ComponentsModule,
    SocialNetworksPageRoutingModule
  ],
  declarations: [SocialNetworksPage]
})
export class SocialNetworksPageModule {}
