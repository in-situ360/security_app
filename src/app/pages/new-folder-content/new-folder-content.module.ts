import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewFolderContentPageRoutingModule } from './new-folder-content-routing.module';

import { NewFolderContentPage } from './new-folder-content.page';


import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import { ComponentsModule } from 'src/app/components/components.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ComponentsModule,
    NewFolderContentPageRoutingModule
  ],
  declarations: [NewFolderContentPage]
})
export class NewFolderContentPageModule {}
