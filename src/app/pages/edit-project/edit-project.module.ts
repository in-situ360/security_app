import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { IonicModule } from '@ionic/angular';

import { EditProjectPageRoutingModule } from './edit-project-routing.module';

import { EditProjectPage } from './edit-project.page';

import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
    IonicModule,
    TranslateModule,
    EditProjectPageRoutingModule
  ],
  declarations: [EditProjectPage]
})
export class EditProjectPageModule {}
