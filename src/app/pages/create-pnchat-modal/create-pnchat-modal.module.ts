import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { IonicModule } from '@ionic/angular';

import { CreatePnchatModalPageRoutingModule } from './create-pnchat-modal-routing.module';

import { CreatePnchatModalPage } from './create-pnchat-modal.page';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ComponentsModule,
    IonicModule,
    CreatePnchatModalPageRoutingModule
  ],
  declarations: [CreatePnchatModalPage]
})
export class CreatePnchatModalPageModule {}
