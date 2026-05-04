import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Storage } from '@ionic/storage-angular';


import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

//-------PARA PERMISOS
import { Geolocation } from '@capacitor/geolocation';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';
import { Camera, CameraResultType } from '@capacitor/camera';
import { VoiceRecorder, RecordingData, GenericResponse } from 'capacitor-voice-recorder';
import { Stripe, PaymentSheetEventsEnum,ApplePayEventsEnum, GooglePayEventsEnum, PaymentFlowEventsEnum, } from '@capacitor-community/stripe';
import {ModalController, NavController, NavParams, Platform} from '@ionic/angular';
import { ModalRequestPermissionsPage } from '../modal-request-permissions/modal-request-permissions.page';


@Component({
  selector: 'app-cover-page',
  templateUrl: './cover-page.page.html',
  styleUrls: ['./cover-page.page.scss'],
})
export class CoverPagePage implements OnInit {

  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  isAndroid: boolean = false;

  constructor(private translate: TranslateService, private storage: Storage, private utils: UtilitiesService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
    private apiService: ApiService, 
    private utilities: UtilitiesService,
    private modalCtrl: ModalController,
    private platform: Platform,
  ) { 
    this.isAndroid=this.platform.is('android');
  }

  async ngOnInit() {

    
   
  }


  



  async checkMissingPermissions(): Promise<string[]> {
  const missingPermissions: string[] = [];

  // Geolocalización (no tiene check, probamos obtener la posición)
  /*try {
    await Geolocation.checkPermissions();
  } catch (error) {
    missingPermissions.push('Geolocalización');
  }*/

  // Cámara y fotos
  /*const cameraPermissions = await Camera.checkPermissions();
  if (cameraPermissions.camera !== 'granted' || cameraPermissions.photos !== 'granted') {
    missingPermissions.push('Cámara');
  }*/

  // Audio
  /*const audioPermission = await VoiceRecorder.hasAudioRecordingPermission();
  if (!audioPermission.value) {
    missingPermissions.push('Audio');
  }*/

  // Notificaciones push
  const pushPermission = await PushNotifications.checkPermissions();
  if (pushPermission.receive !== 'granted') {
    missingPermissions.push('Push Notifications');
  }

  return missingPermissions;
}



  async requestPushPermission() {
    try {
      let permStatus = await PushNotifications.requestPermissions();

      if (permStatus.receive === 'granted') {
        console.log('Permiso para notificaciones push OK');
      } else {
        console.warn('Permiso para notificaciones push denegado');
      }
    } catch (error) {
      console.error('Error al pedir permiso de notificaciones push:', error);
    }
  }

  

  

  


  async abrirModalPermisos(){
  
  
        let titleText=this.translate.instant('Suscripción necesaria');
        let infoText=this.translate.instant('Hazte con una suscripción superior al Plan I para poder las valoraciones de otros usuarios');
    
        const modal = await this.modalCtrl.create({
          component: ModalRequestPermissionsPage,
          cssClass: 'InvitadoMensajeModal',
          componentProps: {
           
            
            
          },
          backdropDismiss:false
        });
  
        
        return await modal.present();
      }


  async ionViewDidEnter() {
    console.log(this.translate.langs.length);
    this.utils.getLang().then((result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo==null) {
        console.log("No idioma");
        this.utils.saveLang('en');
      } else {
        this.switchLanguage(prefijo || 'en');
      }
    });

    const missing = await this.checkMissingPermissions();
    if (missing.length === 0) {
      console.log('✅ Todos los permisos concedidos');
    } else {
     
      console.warn('❌ Faltan permisos:', missing);
      //this.abrirModalPermisos();
      /*await this.requestGeolocationPermission();
      await this.requestCameraPermission();
      await this.requestAudioPermission();*/
      await this.requestPushPermission();
    }
    console.log('Todos los permisos solicitados');
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    
  }


  
  

  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      //console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
    // console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
     // this.startInterval();
      }
      else{
     // this.clearInterval();

      }
      
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Verifica si la ruta actual no es '/UserSearch'
        if (!event.url.includes('/cover-page')) {
            //console.log('Saliendo de cover-page, limpiando intervalos');
            // this.clearInterval();
        }
        else{
            // this.startInterval();
        }
      }
    });

   

    if(this.interval==null){
    // this.startInterval();
    }


  }

  
  ionViewWillLeave() {
    console.log("Se ejecuta ionViewWillLeave");
    this.clearInterval();
    // this.clearInterval();
  }

  
  ngOnDestroy() {
    this.clearInterval();
    // this.clearInterval();
  }

  


  // Inicia el intervalo para ejecutar la función cada 5 segundos
  private startInterval() {
    this.countSeg=0;
    this.previousDate=new Date();
    if(this.interval==null){
     // console.log("INTERVAL NULL CREANDO UNO NUEVO-----------------------------------");
      this.interval = setInterval(() => {
        this.checkDateDifference();
      }, 2000);
    }
    
  }

  // Limpia el intervalo cuando se sale de la pestaña
  private clearInterval() {
    if (this.interval) {

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:40,screenTime:this.countSeg}).subscribe((result) => {
        console.log('DATOS',result);
        
      }, error => {
        
        console.log(error);
      });

     // clearInterval(this.interval);
      //this.interval = null;
    }
    clearInterval(this.interval);
    this.interval = null;
    
  }


  // Calcula la diferencia entre la fecha anterior y la actual
  private checkDateDifference() {
    const currentDate = new Date();


    if(!this.isActive2){

      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg=this.countSeg+differenceInSeconds;
     // console.log(`cover-page: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
     // console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:40,screenTime:this.countSeg}).subscribe((result) => {
       // console.log('DATOS',result);
        
      }, error => {
        
        console.log(error);
      });

      this.clearInterval();
      return;
    }

   

   
    if (this.isActive2) {
      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg=this.countSeg+differenceInSeconds;
     // console.log(`cover-page: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
     // console.log(this.countSeg);


    } 
    else {
      //console.log('cover-page: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }

  

}
