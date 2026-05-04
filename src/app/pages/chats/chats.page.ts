import { Component, NgZone, OnInit, ViewChildren, QueryList } from '@angular/core';
import { AlertController, IonItemSliding } from '@ionic/angular';
import { Chat } from 'src/app/models/Chat';
import { Mensaje } from 'src/app/models/Mensaje';
import { ApiService } from 'src/app/services/api.service';
import { NotificacionesNuevasService } from 'src/app/services/notificaciones-nuevas.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import {ModalController, NavController,Platform } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';
import { ModalMessagePage } from '../modal-message/modal-message.page';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { Keyboard } from '@capacitor/keyboard';
import { take } from 'rxjs/operators';
import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/User';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit {

  @ViewChildren(IonItemSliding) slidingItems!: QueryList<IonItemSliding>;

  public chats: Chat[] = [];
  public filtChats: Chat[] = [];

  public chatRequests: any = [];
  public filtChatRequests: any = [];

  public isLoading: boolean = true;

  public webChats: Chat[] = [];
  
  public messagesData:any=null;
  isAndroid: boolean = false;
  isIOS: boolean = false;
  isInvited: boolean = false;

  public filtroChat:string='';
  public removechatId: any = null;
  public removefiltchatId: any = null;

  public divOption:any=1;

  webInterval:any = 0;

  public language_code:string='en';


  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  public selectedSegment: string = 'Chats';

  public newIndChat:any=false;
  public newGroupChat:any=false;
  private keyboardListener: any;

  isChargeLoading:boolean=false;

  user;

  constructor(
    public apiService: ApiService,
    private utilities: UtilitiesService,
    private alertCtrl: AlertController,
    private notificacionesService: NotificacionesNuevasService,
    private ngZone: NgZone,
    private platform: Platform,
    private modalCtrl: ModalController,
    public navCtrl: NavController,
    private translate: TranslateService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
  ) { 
    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');
  }

  ngOnInit() {

    this.utilities.getUserId().then((result) => {


      this.apiService.chatUserStatus({userId:result}).subscribe((result) => {
        console.log('DATOS',result);
        if(result['mensajesNuevos']>0){
          this.newIndChat=true;
        }
        else{
          this.newIndChat=false;
        }

        if(result['solicitudesNuevas']>0){
          this.newGroupChat=true;
        }
        else{
          this.newGroupChat=false;
        }
      });

    });

    this.apiService.chatUserStatusChanges.subscribe(() => {

      


      this.utilities.getUserId().then((result) => {


        this.apiService.chatUserStatus({userId:result}).subscribe((result) => {
          console.log('DATOS',result);
          if(result['mensajesNuevos']>0){
            this.newIndChat=true;
          }
          else{
            this.newIndChat=false;
          }

          if(result['solicitudesNuevas']>0){
            this.newGroupChat=true;
          }
          else{
            this.newGroupChat=false;
          }
        });

      });
    });
    
    
  }

  ionViewDidEnter() {

    
    //this.selectedSegment = 'Chats';
    if(history.state.requestNotification!=null){
      //ENTRO EN requestNotification >>>>>>>>>>>>>>>>>>>>>>>>
      this.divOption=2;
     //this.selectedSegment = 'Chats';
      this.selectedSegment = 'Solicitudes';
      this.showOptionPage(2);
    }

    if(history.state.newChatNotification!=null){
      //ENTRO EN newChatNotification >>>>>>>>>>>>>>>>>>>>>>>>
      this.divOption=1;
      //this.selectedSegment = 'Solicitudes';
      this.selectedSegment = 'Chats';
      this.showOptionPage(1);
    }

    /*if(){
      this.showOptionPage(2);
      this.selectedSegment = 'Solicitudes';
    }*/


    this.apiService.chatsChanges.subscribe(() => {
      console.log('<--------(chatsChanges)---------->');
      
      this.getChats();
      
    });


    this.apiService.userRequests.subscribe(() => {
      console.log('<--------(userRequestsChanges)---------->');
      
      this.obtainUserRequests();
    });

    this.apiService.userRequestsOption.subscribe(() => {
      console.log('<--------(userRequestsOption)---------->');
      this.divOption=2;
      
    });

    this.apiService.chatsOption.subscribe(() => {
      console.log('<--------(chatsOption)---------->');
      this.divOption=1;
      
    });
  }


  async abrirModalInvitado(){
    const modal = await this.modalCtrl.create({
      component: InvitadoModalPage,
      cssClass: 'InvitadoMensajeModal',
      componentProps: {
       /* district: this.charge.mesaControl.district,*/
        
        
      },
     // backdropDismiss:false
    });
    return await modal.present();
  }


  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.language_code=language;
  }

  public ionViewWillEnter(){

    this.apiService.getEntity('user').subscribe((user : User) => {
      this.user = user;
    })
    this.keyboardListener = Keyboard.addListener('keyboardDidHide', () => { 
      console.log('HOLA CHATS');
      if (this.router.url.includes('tabs/chats')) {
        console.log('El teclado se ha cerrado del chat>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        // Aquí puedes ejecutar acciones cuando el teclado se cierre
        this.aplicarFiltro();
      }
    }); 
    
    this.selectedSegment = 'Chats';
    this.divOption=1;
    //verificar la plataforma para aplicar estilo de "header"
    this.isAndroid = this.platform.is('android');
    this.isIOS = this.platform.is('ios');




    console.log("SE EJECUTA ionViewWillEnter");
    
    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
        console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
        // this.startInterval();
      }
      else{
        // this.clearInterval();

      }
      
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Verifica si la ruta actual no es '/UserSearch'

        console.log('>>>>>>>>>>>>>');
        console.log(event.url);
        
        console.log('>>>>>>>>>>>>>');
        if (!event.url.includes('tabs/chats')) {
          this.apiService.chatUserStatusChanges.next();
          this.getChats();
          //console.log('Saliendo de chats, limpiando intervalos');
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







    this.utilities.getLang().then((result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo==null) {
        console.log("No idioma");
        this.utilities.saveLang('en');
  
        
      } else {
        
        this.switchLanguage(prefijo || 'en');
      }
    });

    console.log(this.translate.langs.length);
  
    



    

/*
    this.notificacionesService.getObservable().subscribe((mensaje)=>{
      this.ngZone.run(() => {
        this.chats = this.chats.map(x => {
          if (x.id == mensaje.chat_id) {
            x.mensajes_nuevos += 1;
            x.descripcion = mensaje.texto;
          }
          return x;
        });
      })
      
    });
    
    this.getChats();
    */

    if(this.apiService.getUserId()==3){
      this.isInvited=true;
      this.abrirModalInvitado();
    }

    
    
    
  /*  this.notificacionesService.getObservable().subscribe((mensaje) => {
      console.log("🔔 NOTIFICACIÓN DE CHATS RECIBIDA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
  
      this.messagesData = JSON.parse(mensaje.data.mensaje);
      console.log("📩 Datos del mensaje recibido:", this.messagesData);
      
      let chatId = Number(this.messagesData?.chat_id);
      let mensajeId = Number(this.messagesData?.id);
  
      console.log("📌 ID del chat:", chatId);
      console.log("📌 ID del mensaje:", mensajeId);
  
      this.ngZone.run(() => {
          this.chats = this.chats.map(chat => {
              if (chat.id === chatId) {
                  console.log(`✅ El mensaje pertenece al chat ${chatId}`);
                  
                  // Verificamos si el chat tiene `lastMensajeId`
                  if (!chat.hasOwnProperty('lastMensajeId')) {
                      console.log("🔹 El chat no tenía `lastMensajeId`, creando campo...");
                      chat.lastMensajeId = mensajeId; // Se crea el campo y se guarda la ID
                  } else {
                      console.log("🔹 El chat ya tiene un `lastMensajeId`:", chat.lastMensajeId);
                      
                      if (chat.lastMensajeId === mensajeId) {
                          console.log("⚠️ El mensaje ya está en la lista, no se añadirá.");
                          //this.utilities.showToast("ya está");
                          return chat; // No hacemos cambios si ya existe
                      } else {
                          console.log("🆕 Nuevo mensaje detectado, actualizando...");
                          chat.lastMensajeId = mensajeId; // Guardamos la nueva ID
                      }
                  }
  
                  this.removechatId = chat.id;
                  chat.mensajes_nuevos += 1;
                  chat.descripcion = mensaje.texto;
              }
              return chat;
          });
  
          const found = this.chats.find(element => element.id === this.removechatId);
          if (found) {
              this.chats = this.chats.filter(chat => chat.id !== this.removechatId);
              this.chats.unshift(found);
          }
  
          const foundfilt = this.filtChats.find(chat => chat.id === this.removechatId);
          if (foundfilt) {
              this.filtChats = this.filtChats.filter(chat => chat.id !== this.removechatId);
              this.filtChats.unshift(foundfilt);
          }
      });
  });*/


  this.notificacionesService.getObservable().subscribe((mensaje) => {
    console.log("🔔 NOTIFICACIÓN DE CHATS RECIBIDA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    // Asegurar que el mensaje esté bien parseado
    this.messagesData = JSON.parse(mensaje.data.mensaje || "{}"); // Si no existe, se usa "{}" para evitar errores

    let chatId = Number(this.messagesData?.chat_id);
    
    // 🔍 Intentar obtener el mensajeId desde `id` y si no está, buscar en `mensaje_id`
    let mensajeId = Number(this.messagesData?.id) || Number(this.messagesData?.mensaje_id);

    console.log("📌 ID del chat:", chatId);
    console.log("📌 ID del mensaje:", mensajeId);

    if (isNaN(chatId) || isNaN(mensajeId) || !chatId || !mensajeId) {
        console.log("🚨 ERROR: Datos inválidos en la notificación, se ignorará.");
        return;
    }

    this.ngZone.run(() => {
        this.chats = this.chats.map(chat => {
            if (chat.id === chatId) {
                console.log(`✅ El mensaje pertenece al chat ${chatId}`);

                // Verificamos si el chat tiene `lastMensajeId`
                if (!chat.hasOwnProperty('lastMensajeId')) {
                    console.log("🔹 El chat no tenía `lastMensajeId`, creando campo...");
                    chat.lastMensajeId = mensajeId; // Se crea el campo y se guarda la ID
                } else {
                    console.log("🔹 El chat ya tiene un `lastMensajeId`:", chat.lastMensajeId);

                    if (chat.lastMensajeId === mensajeId) {
                        console.log("⚠️ El mensaje ya está en la lista del chat, no se añadirá.");
                       // this.utilities.showToast("ya está");
                        return chat; // No hacemos cambios si ya existe
                    } else {
                        console.log("🆕 Nuevo mensaje detectado, actualizando...");
                        chat.lastMensajeId = mensajeId; // Guardamos la nueva ID
                    }
                }

                this.removechatId = chat.id;
                chat.mensajes_nuevos += 1;
                chat.descripcion = this.messagesData.texto;
            }
            return chat;
        });

        const found = this.chats.find(element => element.id === this.removechatId);
        if (found) {
            this.chats = this.chats.filter(chat => chat.id !== this.removechatId);
            this.chats.unshift(found);
        }

        const foundfilt = this.filtChats.find(chat => chat.id === this.removechatId);
        if (foundfilt) {
            this.filtChats = this.filtChats.filter(chat => chat.id !== this.removechatId);
            this.filtChats.unshift(foundfilt);
        }
    });
});

  
  this.getChats();
  this.obtainUserRequests();
  
  }


  public getChats(): void {

    this.ngZone.run(() => {
          
          this.isLoading = true;
      /*
          this.apiService.getSubEntity('chats', 1, 'mensajes').subscribe((mensajes: Mensaje[]) => {
            console.log("Mensajes",mensajes);
          },error=>{
            console.log(error);
          });
      */




      this.apiService.getEntity('chats').pipe(take(1)).subscribe((chats: Chat[]) => {
        //this.newIndChat=false;
        this.isLoading = false;
        console.log("----------------");
        //console.log(this.chats);
        
        this.chats = chats.map(x => {

          /*if(x?.mensajes_nuevos>0){
            this.newIndChat=true;
          }*/
          
          console.log(x.otherUser.theuser.avatar);
          x.avatar=x.otherUser.theuser.avatar;
          //console.log(x.avatar);
          if (x.ultimo_mensaje){

            
            console.log(x);
            console.log(x.ultimo_mensaje);
            if(x.ultimo_mensaje.pdfbase64!=null){
             
              console.log("DATOS IDS:");
              console.log(x.otherUser.user_id);
              console.log(this.apiService.getUserId());
              console.log("-----------------");
             
              if(this.apiService.getUserId()!=x.ultimo_mensaje.user_id){
                x.descripcion = this.translate.instant('chats.{{nombreUsuario}}: ha enviado un PDF', { nombreUsuario: x.otherUser.theuser.name });
              }
              else{
                x.descripcion = this.translate.instant('chats.Tú: has enviado un PDF');
              }
            }
            else if(x.ultimo_mensaje.audiobase64!=null){
             
              console.log("DATOS IDS:");
              console.log(x.otherUser.user_id);
              console.log(this.apiService.getUserId());
              console.log("-----------------");
             
              if(this.apiService.getUserId()!=x.ultimo_mensaje.user_id){
                x.descripcion = this.translate.instant('chats.ha enviado un AUDIO', { name: x.otherUser.theuser.name });
              }
              else{
                x.descripcion = this.translate.instant('chats.Tú: has enviado un AUDIO');
              }
            }
            else if(x.ultimo_mensaje.imagen!=null){
              console.log("DATOS IDS:");
              console.log(x.otherUser.user_id);
              console.log(this.apiService.getUserId());
              console.log("-----------------");
              if(this.apiService.getUserId()!=x.ultimo_mensaje.user_id){
                x.descripcion = this.translate.instant('chats.ha enviado una imagen', { name: x.otherUser.theuser.name });
              }
              else{
                x.descripcion = this.translate.instant('chats.Tú: has enviado una imagen');
              }
            }
            else{
              console.log("DATOS IDS:");
              console.log(x.otherUser.user_id);
              console.log(this.apiService.getUserId());
              console.log("-----------------");

              if(this.apiService.getUserId()!=x.ultimo_mensaje.user_id){
                x.descripcion=x.otherUser.theuser.name+": "+x.ultimo_mensaje.texto;
              }
              else{
                x.descripcion = this.translate.instant('chats.Tú: {{mensaje}}', { mensaje: x.ultimo_mensaje.texto });
              }
            }

              
          }
          else
          x.descripcion = this.translate.instant('chats.Sin mensajes aún');
          if (x.ultimo_mensaje){
            x.ultimo_mensaje = x.ultimo_mensaje.created_at;
          }
          else
            x.ultimo_mensaje = Date.now();
          return x;
        }
        );
        //console.log(this.chats);
        this.filtChats=this.chats;

        if(this.filtroChat && this.filtroChat.trim() !== "") {
          this.aplicarFiltro();
        }
          if(!this.platform.is('ios') && !this.platform.is('android')){

            this.obtenerMensajesNuevos();
          }
      }, error => {
        console.log(error);
        this.isLoading = false;
        this.translate.get("chats.No se pueden obtener los chats").subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText);
          });
        });
    })
  }


  public async salirseChat(chat: Chat) {

    let text1=this.translate.instant('chats.Borrar chat');
    let text2=this.translate.instant('chats.¿Quieres borrar el chat ');
    let text3=this.translate.instant('chats.Cancelar');
    let text4=this.translate.instant('chats.Aceptar');


    const alert = await this.alertCtrl.create({
      header: text1,
      message: text2 + chat.nombre + ' ?',
      buttons: [
        {
          text: text3,
          role: 'cancel',
          handler: () => {
          }
        }, {
          text: text4,
          handler: () => {
            this.translate.get("chats.Borrando chat").subscribe((translatedText: string) => {
              //this.utilities.showLoading(translatedText);
              this.isChargeLoading=true;

          });
                      this.apiService.deleteSubEntity('chats', chat.id, 'unirse', 1).subscribe((res) => {
             // console.log(res);
             // this.utilities.dismissLoading();
              this.isChargeLoading=false;

              this.getChats();
            }, error => {
              console.log(error);
              //this.utilities.dismissLoading();
              this.isChargeLoading=false;

              this.translate.get("chats.No se ha podido borrar el chat").subscribe((translatedText: string) => {
                this.utilities.showToast(translatedText);
              });
            });
          }
        }
      ]
    });

    await alert.present();

  }



  // Método para cerrar todos los slides abiertos
  closeAllSlides() {
    if (this.slidingItems) {
      this.slidingItems.forEach(slidingItem => {
        slidingItem.close();
      });
    }
  }

  goToInteriorC($arg1,$arg2,$arg3,$arg4,$arg5=null,$arg6){
   // console.log($arg1);
   // console.log($arg2);
   // console.log($arg3);
   // console.log($arg4);

    // Cerrar todos los slides antes de navegar
    this.closeAllSlides();
    
    this.navCtrl.navigateForward('interior-chat', { state: { id_chat:$arg1,nombre_chat:$arg2,ultimo_mensaje:$arg3,avatar:$arg4,telNumber: $arg5,userId:$arg6} });
  }


  voldemort2(){
    

    this.navCtrl.navigateRoot('interior-chat');
  }




  aplicarFiltro(){
    /*console.log('Nuevo valor del input:', this.filtroChat);
    //this.filtChats=this.chats;
    this.filtChats = this.chats.filter(chat => chat?.otherUser?.theuser?.name.includes(this.filtroChat));
    console.log(this.chats.filter(chat => chat?.otherUser?.theuser?.name.includes(this.filtroChat)));*/

    // Cerrar todos los slides al aplicar filtro
    this.closeAllSlides();

   // console.log('Nuevo valor del input:', this.filtroChat);

    // Convertir el filtro a minúsculas para comparación insensible a mayúsculas/minúsculas
    const filtroEnMinusculas = this.filtroChat.toLowerCase();




    // Filtrar chats y comparar nombres en minúsculas
    this.filtChats = this.chats.filter(chat => {
        // Obtener el nombre del usuario en minúsculas para comparación
        const nombreEnMinusculas = chat?.otherUser?.theuser?.name?.toLowerCase();
        
        // Verificar si el nombre en minúsculas incluye el filtro en minúsculas
        return nombreEnMinusculas?.includes(filtroEnMinusculas);
    });

    //console.log(this.filtChats);



   // this.chatRequests= [];
   // this.filtChatRequests= [];

   this.filtChatRequests = this.chatRequests.filter(chatRequest => {
    // Obtener el nombre del usuario en minúsculas para comparación
    const nombreEnMinusculas = chatRequest?.requestinguser?.name?.toLowerCase();
    
    // Verificar si el nombre en minúsculas incluye el filtro en minúsculas
    return nombreEnMinusculas?.includes(filtroEnMinusculas);
    });



  }




  obtenerMensajesNuevos(){

    

    this.webInterval=setInterval(() => {
      console.log('obtenerMensajesNuevos para web');

      //---------------------

      
      this.apiService.getEntity('chats').pipe(take(1)).subscribe((chats: Chat[]) => {
       
        this.webChats = chats.map(x => {
          x.avatar=x.otherUser.theuser.avatar;
          //console.log(x.avatar);
          if (x.ultimo_mensaje)
            x.descripcion = x.ultimo_mensaje.texto;
          else
          this.translate.get("chats.Sin mensajes aún").subscribe((translatedText: string) => {
            x.descripcion = translatedText;
            });
          if (x.ultimo_mensaje)
            x.ultimo_mensaje = x.ultimo_mensaje.created_at;
          else
            x.ultimo_mensaje = Date.now();
          return x;
        }
        );
        //console.log(this.chats);
        



        //------------------------------




        if (this.webChats !== this.chats) {
          // Verifica si hay diferencias en los mensajes nuevos
          let shouldUpdateChats = false;
      
          // Recorre los chats en this.chats
          for (let i = 0; i < this.chats.length; i++) {
              const chat = this.chats[i];
              
              // Busca el chat correspondiente en this.webChats por índice
              if (i < this.webChats.length) {
                  


                // Busca el chat correspondiente en this.webChats por su id
                const webChat = this.webChats.find(webChat => webChat.id === chat.id);
                
                if (webChat) {
                    // Compara los valores de mensajes_nuevos para el mismo chat en ambos arreglos
                    if (chat.mensajes_nuevos !== webChat.mensajes_nuevos) {
                        shouldUpdateChats = true;
                        break; // Si encuentra una diferencia, sale del bucle
                    }
                } else {
                    // Si no se encuentra el chat correspondiente en this.webChats, también debería actualizar
                    shouldUpdateChats = true;
                    break;
                }




              } else {
                  // Si no hay chat correspondiente en this.webChats, también debería actualizar
                  shouldUpdateChats = true;
                  break;
              }
          }
      
          // Si se encontraron diferencias, actualiza this.chats con this.webChats
          if (shouldUpdateChats) {
            //console.log("<<<<<<<<<<<<<<ENTRA>>>>>>>>>>>>>>>>");
              this.chats = this.webChats;
              this.aplicarFiltro();
            }
      }







        //-------------------------------

        
      }, error => {
        console.log(error);
       
        this.translate.get("chats.No se pueden obtener los chats").subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText);
          });
        });

    
    

      //--------------------
    }, 2500);
  }

  ngOnDestroy() {

    //this.clearInterval();

    if(!this.platform.is('ios') && !this.platform.is('android')){
      clearInterval(this.webInterval);
    }

    if (this.keyboardListener) {
      this.keyboardListener.remove();
      console.log('Listener de teclado eliminado ✅');
    }


    
//-

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      console.log("Suscripción a la ruta eliminada ✅");
    }
//-

    if (this.notificacionesService) {
      this.notificacionesService.remove();
      console.log('Notificaciones eliminadas ✅');
      this.notificacionesService = null;
    }
//-
    if(this.webInterval) {
      clearInterval(this.webInterval);
      this.webInterval = null;
    }

        
  }












  showOptionPage($opc){
    
    // Cerrar todos los slides al cambiar de pestaña
    this.closeAllSlides();
    
    this.divOption=$opc
   // console.log(this.divOption);
   if($opc==1){
    this.getChats();
   }
   else{
    this.obtainUserRequests();
   }

  }



  public obtainUserRequests(){//getSimilarCourses

    this.ngZone.run(() => {
    
    //this.utilities.showLoading('');
    this.chatRequests= [];
    this.filtChatRequests= [];
   
    
    this.apiService.obtainUserRequests({language_code:this.language_code}).subscribe((result) => {
      //console.log('DATOS',result);
      this.newGroupChat=false;
      this.chatRequests=result;
      this.filtChatRequests=this.chatRequests;

      
      this.chatRequests.forEach(element => {
        
        if(element.user_id != this.user.id){
          this.newGroupChat=true;
          // Corto el bucle
          return;

        }
      });

      // if(this.chatRequests.length>0){

      //   this.newGroupChat=true;
      // }
      //this.utilities.dismissLoading();

      if(this.filtroChat && this.filtroChat.trim() !== "") {
        this.aplicarFiltro();
      }
      
    }, error => {
       //this.utilities.dismissLoading();
        this.translate.get('chats.No se pudieron obtener las solicitudes').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText);
        });
        console.log(error);
    });
  })
  }

    
    
    
  async abrirModal($mes,$name){

    
      const modal = await this.modalCtrl.create({
        component: ModalMessagePage,
        cssClass: 'messageModal',
        componentProps: {
          messageValue: $mes,
          nameValue: $name,
          
          
        },
      });
      return await modal.present();
  }
    
  


  public deleteUserRequests($id){

    this.apiService.deleteUserRequests({id:$id}).subscribe((result) => {
     // console.log('DATOS',result);
      if(result['state']=="REQUEST-DELETED"){
        //LA ELIMINO DEL LISTADO
        this.chatRequests = this.chatRequests.filter(request => request.id !== $id);
        this.filtChatRequests = this.filtChatRequests.filter(request => request.id !== $id);

        this.apiService.chatUserStatusChanges.next();
        this.translate.get('chats.Solicitud eliminada exitósamente').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText);
        });
        
      }
      else{
        this.translate.get('chats.Resultado desconocido').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText);
        });

      }
      
    

    }, error => {
      this.translate.get('chats.No se pudo eliminar la solicitud').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
          console.log(error);
    });

    

  }


  public acceptUserRequests($id){
    //this.utilities.showLoading('');
    this.isChargeLoading=true;

    this.apiService.acceptUserRequests({id:$id}).subscribe((result) => {
      //console.log('DATOS',result);
      if(result['state']=="REQUEST-ACCEPTED"){
        setTimeout(() => {
          //this.utilities.dismissLoading();
          this.isChargeLoading=false;

        }, 500);
        //LA ELIMINO DEL LISTADO
        this.chatRequests = this.chatRequests.filter(request => request.id !== $id);
        this.filtChatRequests = this.filtChatRequests.filter(request => request.id !== $id);
        this.apiService.chatUserStatusChanges.next();
        this.translate.get('chats.Solicitud aceptada exitósamente').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText);
        });
        
      }
      else if(result['state']=="REQUEST-NOT-EXIST"){
        //LA ELIMINO DEL LISTADO
        setTimeout(() => {
          //this.utilities.dismissLoading();
          this.isChargeLoading=false;

        }, 500);
        this.chatRequests = this.chatRequests.filter(request => request.id !== $id);
        this.filtChatRequests = this.filtChatRequests.filter(request => request.id !== $id);
        this.apiService.chatUserStatusChanges.next();
        this.translate.get('chats.La solicitud ya no es válida').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText);
        });

        
      }
      else{
        setTimeout(() => {
          //this.utilities.dismissLoading();
          this.isChargeLoading=false;

        }, 500);
        this.translate.get('chats.Resultado desconocido').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText);
        });
      }
      
    

    }, error => {
      //this.utilities.dismissLoading();
      this.isChargeLoading=false;

      this.translate.get('chats.No se pudo aceptar la solicitud').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
      console.log(error);
    });

    

  }














  //ionViewWillEnter() {
 /*   console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
        console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
        //this.startInterval();
      }
      else{
        //this.clearInterval();

      }
      
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Verifica si la ruta actual no es '/UserSearch'

        console.log('>>>>>>>>>>>>>');
        console.log(event.url);
        console.log('>>>>>>>>>>>>>');
        if (!event.url.includes('/workspace')) {
          console.log('Saliendo de workspace, limpiando intervalos');
          //this.clearInterval();
        }
        else{
          //this.startInterval();
        }
      }
    });

   

    if(this.interval==null){
      //this.startInterval();
    }
*/

 // }

  
  ionViewWillLeave() {
    console.log("Se ejecuta ionViewWillLeave");
    // this.clearInterval();
    if (this.keyboardListener) {
      this.keyboardListener.remove();
      console.log('Listener de teclado eliminado ✅');
    }
    


    //--
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      console.log("Suscripción a la ruta eliminada ✅");
    }

//-
    if (this.notificacionesService) {
      this.notificacionesService.remove();
      console.log('Notificaciones eliminadas ✅');
      this.notificacionesService = null;
    }
//-
    if(this.webInterval) {
      clearInterval(this.webInterval);
      this.webInterval = null;
    }
  }

  
  //ngOnDestroy() {
    //this.clearInterval();
  //}

  


  // Inicia el intervalo para ejecutar la función cada 5 segundos
  private startInterval() {
    this.countSeg=0;
    this.previousDate=new Date();
    if(this.interval==null){

      console.log("INTERVAL NULL CREANDO UNO NUEVO-----------------------------------");
      this.interval = setInterval(() => {
        this.checkDateDifference();
      }, 2000);
    }
    
  }

  // Limpia el intervalo cuando se sale de la pestaña
  private clearInterval() {
    if (this.interval) {

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:16,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`chats: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:16,screenTime:this.countSeg}).subscribe((result) => {
        console.log('DATOS',result);
        
      }, error => {
        
        console.log(error);
      });

      //this.clearInterval();
      return;
    }

   

   
    if (this.isActive2) {
      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg=this.countSeg+differenceInSeconds;
      console.log(`chats: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('chats: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }
  

  onEnterPress(event: KeyboardEvent) {
    // Verificar si la tecla presionada es Enter
    if (event.key === 'Enter') {
      console.log("Se pulsó Enter");
      Keyboard.hide();  // Cierra el teclado en dispositivos móviles
      console.log("///");
     // this.aplicarFiltro();
    }
    
  }


  onSearchClear() {
    console.log("Se pulsó la X, limpiando búsqueda.");
    this.filtroChat = ''; // Limpia la variable vinculada
    this.aplicarFiltro();
  }

  // Método para manejar clics en el contenido y cerrar slides
  onContentClick(event: Event) {
    // Verificar si el clic no fue en un botón de slide o en el área de deslizamiento
    const target = event.target as HTMLElement;
    
    // Si el clic no fue en un botón de opciones del slide, cerrar todos los slides
    if (!target.closest('ion-item-options') && !target.closest('ion-item-option')) {
      this.closeAllSlides();
    }
  }








  async FullSwipeDelete($chat, slidingItem: any){

    console.log($chat);
  


    let cancelarText=this.translate.instant('Cancelar');
      let advertenciaText=this.translate.instant('Advertencia');
      let messText=this.translate.instant('¿Estás seguro de eliminar el chat?');
      let aceptarText=this.translate.instant('Aceptar');
      let mesBorradoText=this.translate.instant('Chat borrado con éxito');
      let mesBorradoErrorText=this.translate.instant('No se pudo borrar el chat');


      const alert = await this.alertCtrl.create({
        header:advertenciaText,
        message: messText,
        cssClass: 'custom-button-class',
        buttons: [
          {
            text: cancelarText,
            role: 'cancel',
            cssClass: 'custom-button-class',
            handler: () => {
              console.log('Clic en Cancelar');
              slidingItem.close();
            }
          },
          {
            text: aceptarText,
            cssClass: 'custom-button-class',
            handler: () => {
              console.log('Clic en Aceptar');
              
  
              this.chats = this.chats.filter(n => n !== $chat);
              this.filtChats= this.filtChats.filter(n => n !== $chat);
  
              this.apiService.deleteChat({ chatId: $chat.id}).subscribe((result) => {
                this.utilities.showToast(mesBorradoText);
               
              
              }, error => {
                this.utilities.showToast(mesBorradoErrorText);
                console.log(error);
             });
  
              
              
              
  
              
             
            },
            //cssClass: 'custom-button-class' 
          }
        ]
      });
  
      await alert.present();
    }

   


  

  async delete($chat, slidingItem: any){

    console.log($chat);
    



    let cancelarText=this.translate.instant('Cancelar');
      let advertenciaText=this.translate.instant('Advertencia');
      let messText=this.translate.instant('¿Estás seguro de eliminar el chat?');
      let aceptarText=this.translate.instant('Aceptar');
      let mesBorradoText=this.translate.instant('Chat borrado con éxito');
      let mesBorradoErrorText=this.translate.instant('No se pudo borrar el chat');


      const alert = await this.alertCtrl.create({
        header:advertenciaText,
        message: messText,
        cssClass: 'custom-button-class',
        buttons: [
          {
            text: cancelarText,
            role: 'cancel',
            cssClass: 'custom-button-class',
            handler: () => {
              console.log('Clic en Cancelar');
              slidingItem.close();
            }
          },
          {
            text: aceptarText,
            cssClass: 'custom-button-class',
            handler: () => {
              console.log('Clic en Aceptar');
              
  
              this.chats = this.chats.filter(n => n !== $chat);
              this.filtChats= this.filtChats.filter(n => n !== $chat);
  
              this.apiService.deleteChat({ chatId: $chat.id}).subscribe((result) => {
                this.utilities.showToast(mesBorradoText);
               
              
              }, error => {
                this.utilities.showToast(mesBorradoErrorText);
                console.log(error);
             });
  
              
              
              
  
              
             
            },
            //cssClass: 'custom-button-class' 
          }
        ]
      });
  
      await alert.present();


  }
}
