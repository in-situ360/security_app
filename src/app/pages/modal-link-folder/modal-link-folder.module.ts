import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalLinkFolderPageRoutingModule } from './modal-link-folder-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import { ModalLinkFolderPage } from './modal-link-folder.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ModalLinkFolderPageRoutingModule
  ],
  declarations: [ModalLinkFolderPage]
})
export class ModalLinkFolderPageModule {}
