import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyJobsPageRoutingModule } from './my-jobs-routing.module';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { MyJobsPage } from './my-jobs.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    IonicModule,
    ComponentsModule,
    MyJobsPageRoutingModule
  ],
  declarations: [MyJobsPage]
})
export class MyJobsPageModule {}
