import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/components.module';

import { IonicModule } from '@ionic/angular';

import { ModalMenuFolderPageRoutingModule } from './modal-menu-folder-routing.module';

import { ModalMenuFolderPage } from './modal-menu-folder.page';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    IonicModule,
    ModalMenuFolderPageRoutingModule
  ],
  declarations: [ModalMenuFolderPage]
})
export class ModalMenuFolderPageModule {}
