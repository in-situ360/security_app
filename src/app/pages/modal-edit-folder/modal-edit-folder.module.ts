import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { ModalEditFolderPageRoutingModule } from './modal-edit-folder-routing.module';

import { ModalEditFolderPage } from './modal-edit-folder.page';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';



import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    ComponentsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    ModalEditFolderPageRoutingModule
  ],
  declarations: [ModalEditFolderPage]
})
export class ModalEditFolderPageModule {}
