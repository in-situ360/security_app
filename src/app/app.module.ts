import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage-angular';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PinchZoomModule } from '@mtnair/ngx-pinch-zoom';
import { ImageCropperModule } from 'ngx-image-cropper';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

//---------------------------------(MULTI LENGUAJE)-----------------------------------------
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
//------------------------------------------------------------------------------------------
import { Globalization } from '@awesome-cordova-plugins/globalization/ngx';


// import { InAppPurchase2 } from '@awesome-cordova-plugins/in-app-purchase-2/ngx';

//import WaveSurfer from 'wavesurfer.js';

// Registrar los datos de localización para 'es-ES'
registerLocaleData(localeEs);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(
      {
        mode: 'ios',
      }
    ), 
    AppRoutingModule,
    HttpClientModule,
    PdfViewerModule,
    ImageCropperModule,
    IonicStorageModule.forRoot(),
    //------------------(MULTI LENGUAJE)------------
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
    //----------------------------------------------
  ],
  providers: [
    Device,
    PinchZoomModule,
    Globalization,
    //WaveSurfer,
    // InAppPurchase2,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: 'es-ES' }, // Configuro 'es-ES' como localización predeterminada
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
