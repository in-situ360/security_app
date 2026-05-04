import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { ModalAddFolderPageRoutingModule } from './modal-add-folder-routing.module';

import { ModalAddFolderPage } from './modal-add-folder.page';




import { FormsModule, ReactiveFormsModule } from '@angular/forms';



import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ModalAddFolderPageRoutingModule
  ],
  declarations: [ModalAddFolderPage]
})
export class ModalAddFolderPageModule {}
