
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppChatItemComponent } from './app-chat-item/app-chat-item.component';
import { AppChatGroupComponent } from './app-chat-group/app-chat-group.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AppChatFooterComponent } from './app-chat-footer/app-chat-footer.component';
import { FormsModule } from '@angular/forms';
import { AppChatHeaderComponent } from './app-chat-header/app-chat-header.component';
import { AppLoadingComponent } from './app-loading/app-loading.component';
import { AppNotificationItemComponent } from './app-notification-item/app-notification-item.component';
import { AppRatingComponent } from './app-rating/app-rating.component';
import { AppPnchatFooterComponent } from './app-pnchat-footer/app-pnchat-footer.component';
import { AppPnchatHeaderComponent } from './app-pnchat-header/app-pnchat-header.component';
import { AppPnchatItemComponent } from './app-pnchat-item/app-pnchat-item.component';
import { AppPgchatHeaderComponent } from './app-pgchat-header/app-pgchat-header.component';
import { AppPgchatItemComponent } from './app-pgchat-item/app-pgchat-item.component';
import { AppPgchatFooterComponent } from './app-pgchat-footer/app-pgchat-footer.component';
import { InsituLoadingComponent } from './insitu-loading/insitu-loading.component';

const COMPONENTS = [
  AppChatItemComponent,
  AppChatGroupComponent,
  AppChatFooterComponent,
  AppChatHeaderComponent,
  AppLoadingComponent,
  AppRatingComponent,
  AppPnchatFooterComponent,
  AppPnchatHeaderComponent,
  AppPnchatItemComponent,
  AppPgchatHeaderComponent,
  AppPgchatItemComponent,
  AppPgchatFooterComponent,
  AppNotificationItemComponent,
  InsituLoadingComponent
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule.forRoot(),
    RouterModule,
    FormsModule
  ],
  declarations: [COMPONENTS],
  exports: [COMPONENTS]
})
export class ComponentsModule { }