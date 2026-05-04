import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalMenuProjectPageRoutingModule } from './modal-menu-project-routing.module';

import { ModalMenuProjectPage } from './modal-menu-project.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    IonicModule,
    ModalMenuProjectPageRoutingModule
  ],
  declarations: [ModalMenuProjectPage]
})
export class ModalMenuProjectPageModule {}
