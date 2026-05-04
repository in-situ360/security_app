import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificationsSettingsPageRoutingModule } from './notifications-settings-routing.module';

import { NotificationsSettingsPage } from './notifications-settings.page';

import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
    IonicModule,
    TranslateModule,
    NotificationsSettingsPageRoutingModule
  ],
  declarations: [NotificationsSettingsPage]
})
export class NotificationsSettingsPageModule {}
