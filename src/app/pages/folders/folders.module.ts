import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FoldersPageRoutingModule } from './folders-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { FoldersPage } from './folders.page';


import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ComponentsModule,
    IonicModule,
    TranslateModule,
    FoldersPageRoutingModule
  ],
  declarations: [FoldersPage]
})
export class FoldersPageModule {}
