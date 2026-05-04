import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { IonicModule } from '@ionic/angular';

import { WorkspacePageRoutingModule } from './workspace-routing.module';

import { WorkspacePage } from './workspace.page';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ComponentsModule,
    IonicModule,
    WorkspacePageRoutingModule
  ],
  declarations: [WorkspacePage]
})
export class WorkspacePageModule {}
