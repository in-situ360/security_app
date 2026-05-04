import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import { Device } from '@awesome-cordova-plugins/device/ngx';

import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    FormsModule,
    LoginPageRoutingModule,
    TranslateModule,
    ComponentsModule
  ],
  providers: [
    Device],
  declarations: [LoginPage]
})
export class LoginPageModule {}
