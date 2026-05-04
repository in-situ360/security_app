import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewFolderPageRoutingModule } from './new-folder-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { NewFolderPage } from './new-folder.page';

import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    ComponentsModule,
    NewFolderPageRoutingModule
  ],
  declarations: [NewFolderPage]
})
export class NewFolderPageModule {}
