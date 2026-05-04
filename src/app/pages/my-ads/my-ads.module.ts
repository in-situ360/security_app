import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyAdsPageRoutingModule } from './my-ads-routing.module';

import { MyAdsPage } from './my-ads.page';
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import { AdvertisementItemComponent } from 'src/app/components/advertisement-item/advertisement-item.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    MyAdsPageRoutingModule,
    AdvertisementItemComponent
  ],
  declarations: [MyAdsPage]
})
export class MyAdsPageModule {}
