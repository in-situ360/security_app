import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { IonicModule } from '@ionic/angular';

import { NewProjectPageRoutingModule } from './new-project-routing.module';

import { NewProjectPage } from './new-project.page';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ComponentsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    NewProjectPageRoutingModule
  ],
  declarations: [NewProjectPage]
})
export class NewProjectPageModule {}
