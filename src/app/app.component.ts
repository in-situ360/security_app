import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone } from '@angular/core';
import { NavController, Platform, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { User } from './models/User';
import { ApiService } from './services/api.service';
import { AuthenticationService } from './services/authentication.service';
import { UtilitiesService } from './services/utilities.service';
import {
    ActionPerformed,
    PushNotificationSchema,
    PushNotifications,
    Token,
  } from '@capacitor/push-notifications';
import { NotificacionesNuevasService } from './services/notificaciones-nuevas.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core'; // MULTI LENGUAJE

import { Stripe } from '@capacitor-community/stripe';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Device } from '@awesome-cordova-plugins/device/ngx';

import { PushBridge } from './plugins/push-bridge';
import { SplashModalPage } from './pages/splash-modal/splash-modal.page';


//import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  user: User;
  private men: any = null;
  public isLoading: boolean = true;
  private isActive:boolean=true;
  private splashModalAbierto = false;

  public appPages = [
    {
      title: 'Inicio',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'Perfil',
      url: '/profile',
      icon: 'person'
    },
    {
      title: 'Chats',
      url: '/chats',
      icon: 'chatboxes'
    }

  ]
  constructor(
   //private routerSubscription: Subscription,
    private platform: Platform,
    private apiService: ApiService,
    private auth: AuthenticationService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private router: Router, 
    private storage: Storage,
    private trasnlate: TranslateService,
    private utilities: UtilitiesService,
    private notificationsService : NotificacionesNuevasService,
    private device: Device,
    private zone:NgZone,
    

  ){
    this.platform.ready().then(() => {
      //this.utilities.showToast('✅ Platform ready: iniciando listeners...');
      this.inicializateApp();
      //let appStateCheck = true;
      this.registerAppStateListener();//DESCOMENTAR ESTAAA
      /*App.addListener('appStateChange', (state) => {
       // appStateCheck = false;
       this.utilities.showToast('1');
      });*/

      /*  setTimeout(() => {
          if (appStateCheck) {
            this.utilities.showToast('xxxx');
            appStateCheck = false;
          }
        }, 600);*/


    // // 👈 Registrar listener de appState
             // 👈 Inicializar la app
    
    //this.utilities.showToast('✅ Listeners registrados correctamente');
  
  });


   
    

   

  }

  setupAppLifecycleListeners() {
  this.platform.ready().then(() => {
    // Fallback con document.visibilitychange (útil si pause/resume falla)
    document.addEventListener('visibilitychange', () => {
      this.zone.run(() => {
        if (document.hidden) {
          this.utilities.showToast('📴 App oculta (fallback)');
        } else {
          this.utilities.showToast('🟢 App visible (fallback)');
        }
      });
    });

    // Cordova-based pause/resume
    this.platform.pause.subscribe(() => {
      this.zone.run(() => {
        this.utilities.showToast('⏸ App en segundo plano (pause)');
      });
    });

    this.platform.resume.subscribe(() => {
      this.zone.run(() => {
        this.utilities.showToast('▶️ App en primer plano (resume)');
      });
    });
  });
}



  private setupDataPushListener() {
    console.log("👂 Escuchando DataPushReceived al inicializar");
  
    window.addEventListener("DataPushReceived", (event: any) => {
      console.log("📡 Evento DataPushReceived capturado", event);
  
      // 💡 Este es el truco: Capacitor puede inyectar los datos como propiedades del evento
      const raw = {
        ...event,
      };
  
      console.log("🧾 RAW:", raw);
  
      console.log("🆔 chatId:", raw.chatId);
      console.log("🗑️ messId:", raw.messId);
      console.log("📌 tipoNotificacion:", raw.tipoNotificacion);
  
      this.zone.run(() => {
        if (raw?.tipoNotificacion === 'PNChatMessDeleteNotificacion') {
          //this.utilities.showToast("📣 Llegó bien la notificación de borrado");
        }
  
        this.notificationsService.addNotification({
          title: 'Silenciosa',
          data: raw
        });
      });
    });
  }
  

  private setupDataPushListener0() {
    console.log("👂 Escuchando DataPushReceived al inicializar");
  
    window.addEventListener("DataPushReceived", (event: any) => {
      console.log("📡 Evento DataPushReceived capturado", event);
  
      let raw: any;
  
      try {
        raw = typeof event.detail === 'string' ? JSON.parse(event.detail) : event.detail;
      } catch (e) {
        console.error("❌ Error parseando JSON de notificación:", e);
        return;
      }
  
      console.log("📨 Notificación silenciosa recibida:");
      console.log("🆔 chatId:", raw?.chatId);
      console.log("🗑️ messId:", raw?.messId);
      console.log("📌 tipoNotificacion:", raw?.tipoNotificacion);
  
      // Ejecutar dentro del NgZone para que Angular lo detecte
      this.zone.run(() => {
        //if (raw?.tipoNotificacion === 'PNChatMessDeleteNotificacion') {
          //this.utilities.showToast("📣 Llegó bien la notificación de borrado");
        //}
  
        this.notificationsService.addNotification({
          title: 'Silenciosa',
          data: raw
        });
      });
    });
  }
  
  
  
  


  
/**
   * Nos suscribimos a los cambios dle perfil
   */
public async ngOnInit() {
  this.setupDataPushListener();
  this.auth.authenticationState.subscribe(async token => {
    if (token != 'logout' && token != '') {
      console.log("CAMBIA TOKEN ", token);
      
      this.pushNotifications();
      this.prepararStripe();
      this.apiService.setTokenToHeaders(token);
      

      if(this.apiService.getFromRegister()==1){
        //this.navCtrl.navigateRoot('/finish-profile', { state: { isFromLogin:true }});//EN PRINCIPIO YA NO SE NECESITA PORQUE YA SE TERMINA DE COMPLETAR EL PERFIL ANTES DE CREARLO
        this.navCtrl.navigateRoot('splash').then(() => {
          this.isLoading = false;
        });
      }
      else{
        this.navCtrl.navigateRoot('splash').then(() => {
          this.isLoading = false;
        });
      }

      // 👇 Aquí llamás al plugin después de iniciar sesión y estar en tabs
      try {
        const result = await PushBridge.getPendingPush();
        if (result.data) {
          console.log("📦 Notificación pendiente encontrada:", result.data);

          const event = new CustomEvent("DataPushReceived", { detail: result.data });
          window.dispatchEvent(event); // Dispará el evento como si hubiera llegado directamente
        }
      } catch (e) {
        console.error("❌ Error al obtener push pendiente:", e);
      }
      
      
    } else if (token == 'logout') {
      //this.apiService.removeTokenToHeaders();
      this.navCtrl.navigateRoot('cover-page').then(() => {
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
      console.log("primera vez");
      
    }


    Stripe.initialize({
      publishableKey: environment.stripePublishableKey,
    });

    // IMPORTANTE: para comprobar si la app está o no suspendida, debe ponerse el dominio en la propiedad "domainUrl" del archivo "src/environments/environment.ts"
    this.checkIfAppIsSuspended();
  });

  if (this.platform.is('cordova')) {
    this.platform.ready().then(() => {
   this.storage.get('lang').then((result)=>{
    this.trasnlate.setDefaultLang(result);
    this.trasnlate.use(result)
   });
    });
  }

  this.apiService.userChanges.subscribe((user: User) => {
    this.user = user;
  });
}


  async abrirModalSplash(){

    //this.utilities.showToast("1");

    if (this.splashModalAbierto) {
      console.log("🛑 Ya hay un modal splash abierto");
      return;
    }

    this.splashModalAbierto = true;
    //this.utilities.showToast("2----");

    const modal = await this.modalCtrl.create({
      component: SplashModalPage,
      cssClass: '',
      componentProps: {
       /* district: this.charge.mesaControl.district,*/
        
        
      },
     // backdropDismiss:false
    });

    modal.onDidDismiss().then(() => {
      this.splashModalAbierto = false;
      this.apiService.setShowModalSplash(false); 
      console.log("✅ Modal splash cerrado");
    });
  
    await modal.present();
  }

  public checkIfAppIsSuspended() {
    this.apiService.checkAppDomain().subscribe(async (response) => {
      // no hacemos nada, ya que el dominio de la aplicación estaría activado
    },
      async (errorResponse: HttpErrorResponse) => {
        if (errorResponse.status == 0 || errorResponse.status == 403) {
          this.utilities.showAlert('Esta app no ha sido renovada', 'Si usted es el propietario, por favor hable con nosotros en el 956 105 343 para renovar el servicio o contacte con facturacion@xerintel.es', false);
        }
      })
  }


  public pushNotifications(){
    PushNotifications.requestPermissions().then(async result => {
      if (result.receive === 'granted') {
      // Register with Apple / Google to receive push via APNS/FCM
      const regId = await PushNotifications.register();

      
      } else {
        console.log("error de permisos");
        
       // Show some error
      }
    });

    PushNotifications.addListener('registration',
      (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      console.log('Device UUID:', this.device.uuid);

        this.apiService.guardarTokenDeRegistro(token.value,this.device.uuid).subscribe((response)=>{
          console.log("response" , response);

          
        }, (error)=>{
          console.log("error" , error);
          
        })
      }
    );




  PushNotifications.addListener('registrationError', (error: any) => {
        alert('Error on registration: ' + JSON.stringify(error));
  });
  
  
/*
  document.addEventListener("DataPushReceived", (event: any) => {
    console.log("vanga vamos!");
    let raw: any;
  
    try {
      raw = JSON.parse(event.detail);
    } catch (e) {
      console.error("❌ Error parseando JSON de notificación:", e);
      return;
    }
  
    console.log("📨 Notificación silenciosa recibida:");
    console.log("🆔 chatId:", raw?.chatId);
    console.log("🗑️ messId:", raw?.messId);
    console.log("📌 tipoNotificacion:", raw?.tipoNotificacion);
  
    this.notificationsService.addNotification({
      title: 'Silenciosa',
      data: raw
    });
  });*/


  PushNotifications.addListener('pushNotificationReceived', notification => {
    console.log("RECIBO NOTIFICACION:------>");
    console.log("📨 Notificación recibida:", notification);
    //this.utilities.showToast("DI");

  
    
    this.apiService.chatUserStatusChanges.next();
    /*console.log(notification);
    this.men = JSON.stringify(notification);
    console.log(this.men);
    console.log(this.men['notification']);*/

    if (notification && notification.data) {
      
      const tipoNotificacion = notification.data.tipoNotificacion;
      console.log("Tipo de Notificación:", tipoNotificacion);
      if(tipoNotificacion && tipoNotificacion=='ChatAcceptedNotificacion'){
        console.log("Entro en evento para ChatAcceptedNotificacion")
        this.apiService.chatsChanges.next();
        this.apiService.userRequests.next();//por si tambien tenias una solicitud de esa persona para chat (asi de actualiza el listado y que no te aparezca)
        this.apiService.chatUserStatusChanges.next();
        
      }else if(tipoNotificacion && tipoNotificacion=='ChatNewRequestNotificacion'){
        this.apiService.userRequests.next();
        this.apiService.chatUserStatusChanges.next();
      }
      else if(tipoNotificacion && tipoNotificacion=='ChatAcceptedNotificacion'){

        this.apiService.chatsChanges.next();
      }
      else if(tipoNotificacion && tipoNotificacion=='ProjectEndDateNotificacion'){

        //this.apiService.projectDetailsChanges.next();
      }
    } 
    else {
      console.log("El objeto de notificación o el campo 'data' no está definido.");
    }
  
  

    

    //alert('Push received: ' + JSON.stringify(notification));
   this.notificationsService.addNotification(notification);
    //PushNotifications.removeAllDeliveredNotifications();

  });
  
   



    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('aaa>>>>>>>>>>>>');
        console.log(JSON.stringify(notification));
        
        const data =notification/* JSON.parse(JSON.stringify(notification))*/;
        //console.log(data['notification']);
        console.log('------------------');

       if(data.notification.data.tipoNotificacion){

          if(data.notification.data.tipoNotificacion=='ChatAcceptedNotificacion'){
        
          console.log(data.notification.title);//nombre para el chat
          console.log(data.notification.data);
          console.log('mensaje enviado',data.notification.data.aps.alert.body);//mensaje enviado
          console.log('contenido',data.notification.data.mensaje);//texto enviado    
          
          console.log('chat_id:',data.notification.data.id);
          
        
          console.log('avatar:>>>',data.notification.data.avatar);
          console.log('<<<<<<<<<<<<<<');
          
          //alert('Push action performed: ' + JSON.stringify(notification));
          this.navCtrl.navigateForward('interior-chat', { state: { id_chat:data.notification.data.id,nombre_chat:data.notification.data.mensaje_user_name/*data.notification.title*/,ultimo_mensaje:data.notification.data.aps.alert.body,avatar:data.notification.data.avatar,userId:data.notification.data.mensaje_user_id } });
          }
          if(data.notification.data.tipoNotificacion=='RatingSentNotificacion'){
        
          console.log(data.notification.title);//nombre para el chat
          console.log(data.notification.data);
          console.log('mensaje enviado',data.notification.data.aps.alert.body);//mensaje enviado
          console.log('contenido',data.notification.data.mensaje);//texto enviado    
          
            const userValoredName = data.notification.data.user_valored_name;
            const userValoredId = data.notification.data.user_valored_id;

            console.log('Nombre del usuario valorado:', userValoredName);
            console.log('ID del usuario valorado:', userValoredId);
            this.navCtrl.navigateForward('/user-ratings',{ state: {userValoredId:userValoredId, userName:userValoredName} });
              
        
          
          
          //alert('Push action performed: ' + JSON.stringify(notification));
         // this.navCtrl.navigateForward('interior-chat', { state: { id_chat:data.notification.data.id,nombre_chat:data.notification.title,ultimo_mensaje:data.notification.data.aps.alert.body,avatar:data.notification.data.avatar } });
          }
          else if(data.notification.data.tipoNotificacion=='FolderNewNotificacion'){
            console.log("NOTIFICACION NUEVA CARPETA");
            console.log("folderid: ",data.notification.data.id);
            this.navCtrl.navigateForward('folder-content', { state: { folderId:data.notification.data.id} });

          }//
          else if(data.notification.data.tipoNotificacion=='ProjectEndDateNotificacion'){
            console.log("NOTIFICACION FECHA FIN DE PROYECTO");
            console.log("PROYECTO ID: ",data.notification.data.id);
            const targetUrl = '/detail-proyect';
            const randomValue = Math.random().toString(36).substring(2, 15); // Genera un valor aleatorio único
        
            // Navegar a la misma página, pero con un parámetro único para forzar la redirección
            /*this.router.navigate(['detail-proyect'], {
                queryParams: {
                    timestamp: new Date().getTime(),
                    projectId: data.notification.data.id,
                    random: randomValue  // Añadir un valor aleatorio para hacerlo aún más único
                },
                state: { projectSelected: data.notification.data.id }
            });*/
            this.goProject(data.notification.data.id,randomValue,new Date().getTime());
          }
          else if(data.notification.data.tipoNotificacion=='ProjectNearEndDateNotificacion'){
            console.log("NOTIFICACION FECHA CERCA FIN DE PROYECTO");
            console.log("PROYECTO ID: ",data.notification.data.id);
            const targetUrl = '/detail-proyect';
            const randomValue = Math.random().toString(36).substring(2, 15); // Genera un valor aleatorio único
            this.goProject(data.notification.data.id,randomValue,new Date().getTime());
            // Navegar a la misma página, pero con un parámetro único para forzar la redirección
            /*this.router.navigate(['detail-proyect'], {
                queryParams: {
                    timestamp: new Date().getTime(),
                    projectId: data.notification.data.id,
                    random: randomValue  // Añadir un valor aleatorio para hacerlo aún más único
                },
                state: { projectSelected: data.notification.data.id }
            });*/
          }
          else if(data.notification.data.tipoNotificacion=='ProjectNewNotificacion'){
            console.log("NOTIFICACION FECHA FIN DE PROYECTO");
           
            console.log("PROYECTO ID: ",data.notification.data.id);
            const targetUrl = '/detail-proyect';
            const randomValue = Math.random().toString(36).substring(2, 15); // Genera un valor aleatorio único
        
           
            // Navegar a la misma página, pero con un parámetro único para forzar la redirección
            /*this.router.navigate(['detail-proyect'], {
                queryParams: {
                    timestamp: new Date().getTime(),
                    projectId: data.notification.data.id,
                    random: randomValue  // Añadir un valor aleatorio para hacerlo aún más único
                },
                state: { projectSelected: data.notification.data.id }
            });*/
            this.goProject(data.notification.data.id,randomValue,new Date().getTime());

            
          }
          else if(data.notification.data.tipoNotificacion=='ChatNewRequestNotificacion'){
            console.log("NOTIFICACION SOLICITUD DE CHAT");
            this.apiService.userRequestsOption.next();
            this.navCtrl.navigateForward('/tabs/chats', { state: { requestNotification:true} });
            
          }
          else if(data.notification.data.tipoNotificacion=='ChatNotificacion'){
            console.log("NOTIFICACION SOLICITUD DE CHAT");
            console.log(data.notification.data);

            const mensajeData = JSON.parse(data.notification.data.mensaje);

            // 3. Obtener el `user_id` y `chat_id` del mensaje decodificado
            const userId = mensajeData.user_id;
            const chatId = mensajeData.chat_id;
            const title = notification.notification.title;
            const avatar = notification.notification.data.avatar;

            // Imprimir los valores obtenidos
            console.log("User ID:", userId);
            console.log("Chat ID:", chatId);
            console.log("Título:", title);
            console.log("Avatar:", avatar);
            this.navCtrl.navigateForward('interior-chat', { state: { id_chat:chatId,nombre_chat:title,ultimo_mensaje:null,avatar:avatar,userId:userId } });


           console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

          }//-----------------------------------
          else if(data.notification.data.tipoNotificacion=='PNChatNotificacion'){
            console.log("NOTIFICACION SOLICITUD DE CHAT DE PROYECTO");
            console.log(data.notification.data);

            const mensajeData = JSON.parse(data.notification.data.mensaje);

            // 3. Obtener el `user_id` y `chat_id` del mensaje decodificado
            const userId = mensajeData.user_id;
            const chatId = mensajeData.pn_chat_id;
            const title = notification.notification.title;
            const avatar = notification.notification.data.avatar;

            // Imprimir los valores obtenidos
            console.log("User ID:", userId);
            console.log("Chat ID:", chatId);
            console.log("Título:", title);
            console.log("Avatar:", avatar);
            this.navCtrl.navigateForward('interior-pnchat', { state: { id_chat:chatId,nombre_chat:title,ultimo_mensaje:null,avatar:avatar,userId:userId } });


           console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

          }
          else if(data.notification.data.tipoNotificacion=='PGChatNotificacion'){
            console.log("NOTIFICACION SOLICITUD DE CHAT GRUPAL DE PROYECTO");
            console.log(data.notification.data);

            const mensajeData = JSON.parse(data.notification.data.mensaje);

            // 3. Obtener el `user_id` y `chat_id` del mensaje decodificado
            const userId = mensajeData.user_id;
            const chatId = mensajeData.pg_chat_id;
            const title = notification.notification.data.nombre;
            const avatar = notification.notification.data.avatar;

            // Imprimir los valores obtenidos
            console.log("User ID:", userId);
            console.log("Chat ID:", chatId);
            console.log("Título:", title);
            console.log("Avatar:", avatar);
            this.navCtrl.navigateForward('interior-pgchat', { state: { id_chat:chatId,nombre_chat:title,ultimo_mensaje:null,avatar:avatar,userId:userId } });


           console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

          }
          
        }

      },
    );



  }

  public async prepararStripe(){
    
    }


    inicializateApp(){

      App.addListener('appUrlOpen',(event:URLOpenListenerEvent)=>{
  
  
        this.zone.run(async ()=>{
  
  
  
          const url = event.url;
          //const isStripeRedirect = url.includes('gcars3171://payment');
          const isStripeRedirect = url.includes('insitu3601://payment');
          
  
          if (isStripeRedirect) {
            // the url from stripe redirect
            // com.company.appName://stripe-redirect?redirect_status=succeeded&setup_intent=seti_YOUR_SETI&setup_intent_client_secret=seti_YOUR_CLIENT_SECRET
            await Stripe.handleURLCallback({
              url
    
            });
            return;
          }
  

  
        });
  
      });
  
    }







    public registerAppStateListener() {
      //this.utilities.showToast("1");
      let appStateCheck = true;
      App.addListener('appStateChange', (state) => {
      console.log("📲 Evento appStateChange");
      appStateCheck = false;
      //this.utilities.showToast("1");
      this.isActive = state.isActive;
      //this.utilities.showToast("estado activo: "+this.isActive);
      if (this.isActive) {

       // setTimeout(() => {
          this.zone.run(async () => {
            //this.utilities.showToast("4");
            //this.utilities.showToast(this.router.url);
            await new Promise(resolve => setTimeout(resolve, 300));
            const currentUrl = (this.router.url || '').toLowerCase();
            console.log("🌐 URL actual después de volver:", currentUrl);
            await new Promise(resolve => setTimeout(resolve, 300));
    
            const rutasBloqueadas = ['/splash', '/splash/', 'splash','/'];
            const estaEnSplash = rutasBloqueadas.some(r => currentUrl.includes(r));

            // Esperamos el valor de forma asíncrona
            let showModalSplash = await this.apiService.getShowModalSplash();
    
            if ((currentUrl!='/splash') && (currentUrl!='/') && !this.splashModalAbierto && showModalSplash) {
             // this.utilities.showToast('---current url:'+currentUrl+' splash abierto: '+this.splashModalAbierto+' debe mostrarlo: '+showModalSplash);
              this.abrirModalSplash();
            } else {
              console.log("🛑 No se abre modal splash porque ya estamos en página splash o modal ya abierto");
              //this.utilities.showToast('>>>current url:'+currentUrl+' splash abierto: '+this.splashModalAbierto+' debe mostrarlo: '+showModalSplash);

            }
          });
       // }, 500); // Esperar para que la navegación se estabilice
      } else {
        console.log("🔴 App en segundo plano");
      }
    });


      setTimeout(() => {
          if (appStateCheck) {
            //this.utilities.showToast('Timeout');
            appStateCheck = false;

            this.zone.run(async () => {
              //this.utilities.showToast("4");
              //this.utilities.showToast(this.router.url);
              await new Promise(resolve => setTimeout(resolve, 300));
              const currentUrl = (this.router.url || '').toLowerCase();
              console.log("🌐 URL actual después de volver:", currentUrl);
              await new Promise(resolve => setTimeout(resolve, 300));
      
              const rutasBloqueadas = ['/splash', '/splash/', 'splash','/'];
              const estaEnSplash = rutasBloqueadas.some(r => currentUrl.includes(r));

              // Esperamos el valor de forma asíncrona
              let showModalSplash = await this.apiService.getShowModalSplash();
      
              if ((currentUrl!='/splash') && (currentUrl!='/') && !this.splashModalAbierto && showModalSplash) {
              // this.utilities.showToast('---current url:'+currentUrl+' splash abierto: '+this.splashModalAbierto+' debe mostrarlo: '+showModalSplash);
                this.abrirModalSplash();
              } else {
                console.log("🛑 No se abre modal splash porque ya estamos en página splash o modal ya abierto");
                //this.utilities.showToast('>>>current url:'+currentUrl+' splash abierto: '+this.splashModalAbierto+' debe mostrarlo: '+showModalSplash);

              }
            });


          }
      }, 600);
    }


    public registerAppStateListener0() {
  try {
    this.utilities.showToast('✅ Listener appStateChange registrado');

    App.addListener('appStateChange', (state) => {
      this.utilities.showToast(`📲 appStateChange recibido. isActive: ${state.isActive}`);
      console.log("📲 Evento appStateChange");
      this.isActive = state.isActive;

      if (this.isActive) {
        this.zone.run(async () => {
          try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const currentUrl = (this.router.url || '').toLowerCase();
             await new Promise(resolve => setTimeout(resolve, 300));
            console.log("🌐 URL actual después de volver:", currentUrl);

            const rutasBloqueadas = ['/splash', '/splash/', 'splash', '/'];
            const estaEnSplash = rutasBloqueadas.some(r => currentUrl.includes(r));

            const showModalSplash = await this.apiService.getShowModalSplash();

            if (!estaEnSplash && !this.splashModalAbierto && showModalSplash) {
              this.utilities.showToast(`✅ Mostrando splash modal. URL: ${currentUrl}`);
              await this.abrirModalSplash();
            } else {
              console.log("🛑 No se abre modal splash porque ya estamos en página splash o modal ya abierto");
              this.utilities.showToast(`🛑 No se muestra splash. URL: ${currentUrl} | splash abierto: ${this.splashModalAbierto} | debe mostrar: ${showModalSplash}`);
            }
          } catch (innerError) {
            console.error("❌ Error interno en appStateChange:", innerError);
            this.utilities.showToast("❌ Error dentro de appStateChange: ");
          }
        });
      } else {
        console.log("🔴 App en segundo plano");
        this.utilities.showToast("🔴 App en segundo plano");
      }
    });

  } catch (error) {
    console.error("❌ Error al registrar appStateChange:", error);
    this.utilities.showToast("❌ No se pudo registrar el listener de estado de la app.");
  }
}








  goProject($id,$randomValue,$timestamp){






  this.apiService.obtainProject({projectId:$id,withBase64:false,language_code:'es'}).subscribe((result) => {
    console.log('Result',result);
    let theProject=result;
    console.log("THIS IS WILD");
    console.log(theProject);
    console.log(">>>>>>>>>>");
    this.utilities.getUserId().then((theUserId) => {
      console.log("user id almacenado: ",theUserId);

        if(theProject.user_creator_id==theUserId){
          console.log(`EL CREADOR`);
          this.navCtrl.navigateForward("/detail-proyect", {state: {projectSelected:$id,random:$randomValue,timestamp:$timestamp}});
        } 
        else if(theProject.verifiedUsers.length > 0) {
          console.log('El proyecto tiene usuarios verificados:', theProject.verifiedUsers);

          const userFound = theProject.verifiedUsers.some(user => user.id === theUserId);

          if (userFound) {
            console.log(`El proyecto tiene al usuario en la lista de usuarios verificados.`);
            this.navCtrl.navigateForward("/detail-proyect", {state: {projectSelected:$id,random:$randomValue,timestamp:$timestamp}});
          } 
          else {
            console.log(`El proyecto no tiene el usuario con ese ID en la lista de usuarios verificados.`);
            this.navCtrl.navigateForward("/add-proyect", {state: {projectSelected:theProject}});
          }


        }
        else {
          console.log('El proyecto no tiene usuarios verificados.');
          this.navCtrl.navigateForward("/add-proyect", {state: {projectSelected:theProject}});
        }

    });
  }, error => {
    console.log(error);
  });

  
  }



}
