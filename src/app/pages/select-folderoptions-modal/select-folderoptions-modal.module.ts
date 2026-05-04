import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { IonicModule } from '@ionic/angular';

import { SelectFolderoptionsModalPageRoutingModule } from './select-folderoptions-modal-routing.module';

import { SelectFolderoptionsModalPage } from './select-folderoptions-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    SelectFolderoptionsModalPageRoutingModule
  ],
  declarations: [SelectFolderoptionsModalPage]
})
export class SelectFolderoptionsModalPageModule {}
