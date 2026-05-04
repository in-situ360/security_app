import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FinishRegisterPageRoutingModule } from './finish-register-routing.module';
import { FinishRegisterPage } from './finish-register.page';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, 
    IonicModule,
    TranslateModule,
    ComponentsModule,
    IonicModule,
    FinishRegisterPageRoutingModule
  ],
  declarations: [FinishRegisterPage]
})
export class FinishRegisterPageModule {}
