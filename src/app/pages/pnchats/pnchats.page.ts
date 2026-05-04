import { Component, NgZone, OnInit, QueryList, ViewChildren } from '@angular/core';
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
import { Router } from '@angular/router';
import { CreatePnchatModalPage } from '../create-pnchat-modal/create-pnchat-modal.page';
import { SelectMenuChatPage } from '../select-menu-chat/select-menu-chat.page';
import { Camera, CameraResultType } from '@capacitor/camera';
import { codeErrors } from 'src/app/utils/utils';


@Component({
  selector: 'app-pnchats',
  templateUrl: './pnchats.page.html',
  styleUrls: ['./pnchats.page.scss'],
})
export class PnchatsPage implements OnInit {

  @ViewChildren(IonItemSliding) slidingItems!: QueryList<IonItemSliding>;

  public projectId:any=null;
  public chats: Chat[] = [];
  public filtChats: Chat[] = [];

  public pgchats: any = [];
  public pgfiltChats: any = [];

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
  public selectedSegment: string = 'Chats';

  public newIndChat:any=false;
  public newGroupChat:any=false;

  private keyboardListener: any;
  isChargeLoading:boolean=false;


  public form: FormGroup;
  public base64img: string;

  constructor(private apiService: ApiService,
    private utilities: UtilitiesService,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private notificacionesService: NotificacionesNuevasService,
    private ngZone: NgZone,
    
    private platform: Platform,
    private modalCtrl: ModalController,
    public navCtrl: NavController,private router: Router,//SEGUIMIENTO DE TIEMPO
  ) { 
    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');
    this.projectId=history.state.projectId;
  }

  goBack() {
    //ANTESS this.navCtrl.pop()
    this.navCtrl.pop();
  }


  

  ngOnInit() {

    this.form = new FormGroup({
      image: new FormControl(''),
      chatId: new FormControl(''),

      
    });

     

    
    this.apiService.chatsChanges.subscribe(() => {
      console.log('<--------(chatsChanges)---------->');
      
      this.getChats();
      
    });

    this.keyboardListener = Keyboard.addListener('keyboardDidHide', () => {
      console.log('HOLA PNCHATS');
      if (this.router.url.includes('pnchats')) {
        console.log('El teclado se ha cerrado del pnchat>>>>>>>>>>>>>>>>>>>>');
        // Aquí puedes ejecutar acciones cuando el teclado se cierre
        this.aplicarFiltro();
      }
    }); 


    

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





    //this.selectedSegment = 'Chats';
    //this.showOptionPage(1);
    //verificar la plataforma para aplicar estilo de "header"
    this.isAndroid = this.platform.is('android');
    this.isIOS = this.platform.is('ios');

   // this.utilities.showToast("entro en ionViewWillEnter");


    this.apiService.hasProjectPendingMessages({project_id:this.projectId}).subscribe((result:any) => {
        console.log('DATOS',result);
        this.newIndChat = result.pendingMessagesPn > 0;
        this.newGroupChat = result.pendingMessagesPg > 0;

      }, error => {

        
            
            console.log(error);
          });



    this.notificacionesService.getObservable().subscribe((mensaje) => {
      console.log("🔔 NOTIFICACIÓN DE CHATS RECIBIDA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    
      // 🧠 Parsear mensaje correctamente según su formato
      this.messagesData = typeof mensaje === 'string'
        ? JSON.parse(mensaje)
        : mensaje.data?.mensaje
        ? JSON.parse(mensaje.data.mensaje)
        : mensaje;
    
      console.log("📩 Mensaje recibido:", this.messagesData);

      const tipoNotificacion = mensaje?.data?.tipoNotificacion;
      if (tipoNotificacion) {
        console.log("📢 Tipo de notificación:", tipoNotificacion);
        //this.utilities?.showToast?.(`Tipo de notificación: ${tipoNotificacion}`);
      
        if(tipoNotificacion=='PNChatNotificacion'){
    
            // 🆔 Obtener chatId y mensajeId con compatibilidad
            const chatId = Number(this.messagesData?.pn_chat_id || this.messagesData?.chat_id);
            const mensajeId = Number(this.messagesData?.id) || Number(this.messagesData?.mensaje_id);
          
            // 🧾 Detectar tipo de mensaje (texto, archivo, etc.)
            let mensajeTexto = this.messagesData?.texto || this.messagesData?.archive;
          
            // Si no hay texto ni archivo, usar mensaje genérico
            if (!mensajeTexto) {
              mensajeTexto = "[Mensaje recibido]";
            }
          
            console.log("📌 ID del chat:", chatId);
            console.log("📌 ID del mensaje:", mensajeId);
            console.log("📩 Mensaje texto:", mensajeTexto);
          
            // 🛑 Validación mínima
            if (isNaN(chatId) || isNaN(mensajeId) || !chatId || !mensajeId) {
              console.log("🚨 ERROR: Datos inválidos en la notificación, se ignorará.");
              return;
            }
          
            this.ngZone.run(() => {
              this.chats = this.chats.map(chat => {
                if (chat.id === chatId) {
                  console.log(`✅ El mensaje pertenece al chat ${chatId}`);
          
                  // 🧠 Verificar si ya se recibió ese mensaje antes
                  if (!chat.hasOwnProperty('lastMensajeId')) {
                    console.log("🔹 El chat no tenía `lastMensajeId`, creando campo...");
                    chat.lastMensajeId = mensajeId;
                  } else {
                    console.log("🔹 El chat ya tiene un `lastMensajeId`:", chat.lastMensajeId);
                    if (chat.lastMensajeId === mensajeId) {
                      console.log("⚠️ El mensaje ya está en la lista del chat, no se añadirá.");
                      //this.utilities.showToast("El mensaje ya está en la lista del chat, no se añadirá.");
                      return chat;
                    } else {
                      console.log("🆕 Nuevo mensaje detectado, actualizando...");
                      chat.lastMensajeId = mensajeId;
                    }
                  }
          
                   this.newIndChat = true;
       
                  // 🔄 Actualizar información del chat
                  this.removechatId = chat.id;
                  chat.mensajes_nuevos = (chat.mensajes_nuevos || 0) + 1;
                  chat.descripcion = mensajeTexto;
                }
                return chat;
              });
          
              // 🔝 Mover chat al principio en `chats`
              const found = this.chats.find(chat => chat.id === this.removechatId);
              if (found) {
                this.chats = this.chats.filter(chat => chat.id !== this.removechatId);
                this.chats.unshift(found);
              }
          
              // 🔝 Y también en `filtChats`
              const foundFilt = this.filtChats.find(chat => chat.id === this.removechatId);
              if (foundFilt) {
                this.filtChats = this.filtChats.filter(chat => chat.id !== this.removechatId);
                this.filtChats.unshift(foundFilt);
              }
            });
        }
        
        else if (tipoNotificacion === 'PGChatNotificacion') {
          console.log("📢 Procesando notificación de chat grupal (PGChatNotificacion)");
        
          const groupChatId = Number(this.messagesData?.pg_chat_id || this.messagesData?.chat_id);
          const mensajeId = Number(this.messagesData?.id || this.messagesData?.mensaje_id);
          const mensajeTexto = this.messagesData?.texto || this.messagesData?.archive || "[Mensaje recibido]";
        
          if (isNaN(groupChatId) || isNaN(mensajeId)) {
            console.log("🚨 ERROR: Datos inválidos para PGChatNotificacion, se ignorará.");
            return;
          }
        
          this.ngZone.run(() => {
            this.pgchats = this.pgchats.map(chat => {
              if (chat.id === groupChatId) {
                console.log(`✅ El mensaje pertenece al grupo ${groupChatId}`);
        
                if (!chat.hasOwnProperty("lastMensajeId")) {
                  console.log("🔹 El grupo no tenía lastMensajeId, creándolo...");
                  chat.lastMensajeId = mensajeId;
                } else {
                  console.log("🔹 lastMensajeId actual:", chat.lastMensajeId);
                  if (chat.lastMensajeId === mensajeId) {
                    console.log("⚠️ Mensaje duplicado, no se actualizará.");
                   // this.utilities.showToast("El mensaje ya está en la lista del grupo.");
                    return chat;
                  } else {
                    console.log("🆕 Nuevo mensaje detectado, actualizando...");
                    chat.lastMensajeId = mensajeId;
                  }
                }
               
                this.newGroupChat = true;
        
                // 🧠 Determinar quién lo envió
                const isMine = this.apiService.getUserId() === this.messagesData?.user_id;
                const nombreUsuario = chat.otherUser?.theuser?.name || "Usuario";
        
                // 🧾 Detectar tipo de contenido para la descripción
                if (this.messagesData?.pdfdata) {
                  chat.descripcion = isMine
                    ? this.translate.instant('pnchats.Tú: has enviado un PDF')
                    : this.translate.instant('pnchats.{{nombreUsuario}}: ha enviado un PDF', { nombreUsuario });
                } else if (this.messagesData?.audiobase64) {
                  chat.descripcion = isMine
                    ? this.translate.instant('pnchats.Tú: has enviado un AUDIO')
                    : this.translate.instant('pnchats.ha enviado un AUDIO', { name: nombreUsuario });
                } else if (this.messagesData?.urlimagen || this.messagesData?.imagen) {
                  chat.descripcion = isMine
                    ? this.translate.instant('pnchats.Tú: has enviado una imagen')
                    : this.translate.instant('pnchats.ha enviado una imagen', { name: nombreUsuario });
                } else {
                  chat.descripcion = isMine
                    ? this.translate.instant('pnchats.Tú: {{mensaje}}', { mensaje: mensajeTexto })
                    : `${nombreUsuario}: ${mensajeTexto}`;
                }
        
                chat.mensajes_nuevos = (chat.mensajes_nuevos || 0) + 1;
                chat.ultimo_mensaje = this.messagesData?.created_at;
                this.removechatId = chat.id;
              }
        
              return chat;
            });
        
            // 🔝 Mover al tope en pgchats
            const updated = this.pgchats.find(chat => chat.id === this.removechatId);
            if (updated) {
              this.pgchats = this.pgchats.filter(chat => chat.id !== this.removechatId);
              this.pgchats.unshift(updated);
            }
        
            // 🔝 Mover al tope en pgfiltChats
            const updatedFilt = this.pgfiltChats.find(chat => chat.id === this.removechatId);
            if (updatedFilt) {
              this.pgfiltChats = this.pgfiltChats.filter(chat => chat.id !== this.removechatId);
              this.pgfiltChats.unshift(updatedFilt);
            }
          });
        }
        
       //salvo para pdf e imagen
         /* else if (tipoNotificacion === 'PGChatNotificacion') {
            console.log("📢 Procesando notificación de chat grupal (PGChatNotificacion)");
          
            // Obtener ID del grupo desde `pg_chat_id`
            const groupChatId = Number(this.messagesData?.pg_chat_id);
            const mensajeId = Number(this.messagesData?.id || this.messagesData?.mensaje_id);
            const mensajeTexto = this.messagesData?.texto || this.messagesData?.archive || "[Mensaje recibido]";
          
            if (isNaN(groupChatId) || isNaN(mensajeId)) {
              console.log("🚨 ERROR: Datos inválidos para PGChatNotificacion, se ignorará.");
              return;
            }
          
            this.ngZone.run(() => {
              this.pgchats = this.pgchats.map(chat => {
                if (chat.id === groupChatId) {
                  console.log(`✅ El mensaje pertenece al grupo ${groupChatId}`);
          
                  if (!chat.hasOwnProperty("lastMensajeId")) {
                    console.log("🔹 El grupo no tenía lastMensajeId, creándolo...");
                    chat.lastMensajeId = mensajeId;
                  } else {
                    console.log("🔹 lastMensajeId actual:", chat.lastMensajeId);
                    if (chat.lastMensajeId === mensajeId) {
                      console.log("⚠️ Mensaje duplicado, no se actualizará.");
                      this.utilities.showToast("El mensaje ya está en la lista del grupo.");
                      return chat;
                    } else {
                      console.log("🆕 Nuevo mensaje detectado, actualizando...");
                      chat.lastMensajeId = mensajeId;
                    }
                  }
          
                  // Incrementar nuevos mensajes y actualizar descripción
                  chat.mensajes_nuevos = (chat.mensajes_nuevos || 0) + 1;
                  chat.descripcion = mensajeTexto;
                  chat.ultimo_mensaje = this.messagesData?.created_at;
                  this.removechatId = chat.id;
                }
          
                return chat;
              });
          
              // Mover al tope en pgchats
              const updated = this.pgchats.find(chat => chat.id === this.removechatId);
              if (updated) {
                this.pgchats = this.pgchats.filter(chat => chat.id !== this.removechatId);
                this.pgchats.unshift(updated);
              }
          
              // Mover al tope en pgfiltChats
              const updatedFilt = this.pgfiltChats.find(chat => chat.id === this.removechatId);
              if (updatedFilt) {
                this.pgfiltChats = this.pgfiltChats.filter(chat => chat.id !== this.removechatId);
                this.pgfiltChats.unshift(updatedFilt);
              }
            });
          }*/
          

      }
      else{ 
        //this.utilities?.showToast?.(`NO SALE EL Tipo de notificación`);
      }
    });






















    //VA PERFE PARA PNNOTIFICATION
    /*this.notificacionesService.getObservable().subscribe((mensaje) => {
      console.log("🔔 NOTIFICACIÓN DE CHATS RECIBIDA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    
      // 🧠 Parsear mensaje correctamente según su formato
      this.messagesData = typeof mensaje === 'string'
        ? JSON.parse(mensaje)
        : mensaje.data?.mensaje
        ? JSON.parse(mensaje.data.mensaje)
        : mensaje;
    
      console.log("📩 Mensaje recibido:", this.messagesData);

      const tipoNotificacion = mensaje?.data?.tipoNotificacion;
      if (tipoNotificacion) {
        console.log("📢 Tipo de notificación:", tipoNotificacion);
        this.utilities?.showToast?.(`Tipo de notificación: ${tipoNotificacion}`);
      }
      else{ 
        this.utilities?.showToast?.(`NO SALE EL Tipo de notificación`);
      }
    
      // 🆔 Obtener chatId y mensajeId con compatibilidad
      const chatId = Number(this.messagesData?.pn_chat_id || this.messagesData?.chat_id);
      const mensajeId = Number(this.messagesData?.id) || Number(this.messagesData?.mensaje_id);
    
      // 🧾 Detectar tipo de mensaje (texto, archivo, etc.)
      let mensajeTexto = this.messagesData?.texto || this.messagesData?.archive;
    
      // Si no hay texto ni archivo, usar mensaje genérico
      if (!mensajeTexto) {
        mensajeTexto = "[Mensaje recibido]";
      }
    
      console.log("📌 ID del chat:", chatId);
      console.log("📌 ID del mensaje:", mensajeId);
      console.log("📩 Mensaje texto:", mensajeTexto);
    
      // 🛑 Validación mínima
      if (isNaN(chatId) || isNaN(mensajeId) || !chatId || !mensajeId) {
        console.log("🚨 ERROR: Datos inválidos en la notificación, se ignorará.");
        return;
      }
    
      this.ngZone.run(() => {
        this.chats = this.chats.map(chat => {
          if (chat.id === chatId) {
            console.log(`✅ El mensaje pertenece al chat ${chatId}`);
    
            // 🧠 Verificar si ya se recibió ese mensaje antes
            if (!chat.hasOwnProperty('lastMensajeId')) {
              console.log("🔹 El chat no tenía `lastMensajeId`, creando campo...");
              chat.lastMensajeId = mensajeId;
            } else {
              console.log("🔹 El chat ya tiene un `lastMensajeId`:", chat.lastMensajeId);
              if (chat.lastMensajeId === mensajeId) {
                console.log("⚠️ El mensaje ya está en la lista del chat, no se añadirá.");
                this.utilities.showToast("El mensaje ya está en la lista del chat, no se añadirá.");
                return chat;
              } else {
                console.log("🆕 Nuevo mensaje detectado, actualizando...");
                chat.lastMensajeId = mensajeId;
              }
            }
    
            // 🔄 Actualizar información del chat
            this.removechatId = chat.id;
            chat.mensajes_nuevos = (chat.mensajes_nuevos || 0) + 1;
            chat.descripcion = mensajeTexto;
          }
          return chat;
        });
    
        // 🔝 Mover chat al principio en `chats`
        const found = this.chats.find(chat => chat.id === this.removechatId);
        if (found) {
          this.chats = this.chats.filter(chat => chat.id !== this.removechatId);
          this.chats.unshift(found);
        }
    
        // 🔝 Y también en `filtChats`
        const foundFilt = this.filtChats.find(chat => chat.id === this.removechatId);
        if (foundFilt) {
          this.filtChats = this.filtChats.filter(chat => chat.id !== this.removechatId);
          this.filtChats.unshift(foundFilt);
        }
      });
    });*/
    
    
    //texto e imagenes 
    /*this.notificacionesService.getObservable().subscribe((mensaje) => {
      console.log("🔔 NOTIFICACIÓN DE CHATS RECIBIDA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
  
      // El mensaje ya es un JSON o stringificamos si viene como texto plano
      this.messagesData = typeof mensaje === 'string' ? JSON.parse(mensaje) :
                          mensaje.data?.mensaje ? JSON.parse(mensaje.data.mensaje) :
                          mensaje;
  
      console.log("📩 Mensaje recibido:", this.messagesData);
  
      // Obtener IDs desde el nuevo formato
      const chatId = Number(this.messagesData?.pn_chat_id); // nuevo formato usa `pn_chat_id`
      const mensajeId = Number(this.messagesData?.id) || Number(this.messagesData?.mensaje_id);
      const mensajeTexto = this.messagesData?.texto;
  
      console.log("📌 ID del chat:", chatId);
      console.log("📌 ID del mensaje:", mensajeId);
  
      // Validar existencia de datos mínimos
      if (isNaN(chatId) || isNaN(mensajeId) || !chatId || !mensajeId) {
          console.log("🚨 ERROR: Datos inválidos en la notificación, se ignorará.");
          return;
      }
  
      this.ngZone.run(() => {
          this.chats = this.chats.map(chat => {
              if (chat.id === chatId) {
                  console.log(`✅ El mensaje pertenece al chat ${chatId}`);
  
                  // Si no existe el campo lastMensajeId, lo creamos
                  if (!chat.hasOwnProperty('lastMensajeId')) {
                      console.log("🔹 El chat no tenía `lastMensajeId`, creando campo...");
                      chat.lastMensajeId = mensajeId;
                  } else {
                      console.log("🔹 El chat ya tiene un `lastMensajeId`:", chat.lastMensajeId);
  
                      if (chat.lastMensajeId === mensajeId) {
                          console.log("⚠️ El mensaje ya está en la lista del chat, no se añadirá.");
                          this.utilities.showToast("El mensaje ya está en la lista del chat, no se añadirá.");
                          return chat;
                      } else {
                          console.log("🆕 Nuevo mensaje detectado, actualizando...");
                          chat.lastMensajeId = mensajeId;
                      }
                  }
  
                  this.removechatId = chat.id;
                  chat.mensajes_nuevos = (chat.mensajes_nuevos || 0) + 1;
                  chat.descripcion = mensajeTexto;
              }
              return chat;
          });
  
          // Mover el chat actualizado al principio
          const found = this.chats.find(chat => chat.id === this.removechatId);
          if (found) {
              this.chats = this.chats.filter(chat => chat.id !== this.removechatId);
              this.chats.unshift(found);
          }
  
          // También mover en la lista filtrada si aplica
          const foundFilt = this.filtChats.find(chat => chat.id === this.removechatId);
          if (foundFilt) {
              this.filtChats = this.filtChats.filter(chat => chat.id !== this.removechatId);
              this.filtChats.unshift(foundFilt);
          }
      });
  });*/
  
    
    
    
    

    /*
    
    this.notificacionesService.getObservable().subscribe((mensaje)=>{
      this.utilities.showToast("QUETAL");
      this.messagesData=JSON.parse(mensaje.data.mensaje)
      //console.log('--->',this.messagesData);
      //console.log('--->',Number(this.messagesData?.chat_id));
      this.ngZone.run(() => {
        this.chats = this.chats.map(x => {
          if (x.id == Number(this.messagesData?.chat_id)) {
            this.removechatId = x.id;
            //console.log('id quetar chat: ', this.removechatId);
            //console.log('nº mensaje nuevos: ',x.mensajes_nuevos);
            x.mensajes_nuevos += 1;
            x.descripcion = mensaje.texto;
          }
          return x;
        });
        const found = this.chats.find(element => element.id == this.removechatId);
       // console.log(found);
        this.chats = this.chats.filter(x => x.id !== this.removechatId);
        this.chats.unshift(found);
        //console.log('--------------------------');

       // removefiltchatId
        
        const foundfilt = this.filtChats.find(element => element.id == this.removechatId);
        if(foundfilt!=null){
          this.filtChats = this.filtChats.filter(x => x.id !== this.removechatId);
          this.filtChats.unshift(foundfilt);
        }


      })
      
    });*/
    console.log("carga todos los chats");


    this.utilities.getLang().then((result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo==null) {
        console.log("No idioma");
        this.utilities.saveLang('en');
  
        
      } else {
        
        this.switchLanguage(prefijo || 'en');
      }

      
      this.getGroupChats();
    });

    this.getChats();



    

   // this.obtainUserRequests();
  }


  public getChats(): void {

   //this.utilities.showLoading('');
    this.ngZone.run(() => {
          //aqui mi amorr
          this.isLoading = true;
      



         // this.utilities.showLoading('');
      this.apiService.getPnChats({projectId:this.projectId, language_code:this.language_code}).subscribe((chats: Chat[]) => {
        this.isLoading = false;
       // this.utilities.dismissLoading();
        this.chats = chats.map(x => {
          x.avatar=x.otherUser.theuser.avatar;
          console.log('mensaje nuevos>>');
          console.log(x?.mensajes_nuevos);
          if(x?.mensajes_nuevos>0){
            this.newIndChat=true;
          }
          
          if (x.ultimo_mensaje){

           
            console.log(x);
            console.log(x.ultimo_mensaje);
            if(x.ultimo_mensaje.pdfbase64!=null){
             
              console.log("DATOS IDS:");
              console.log(x.otherUser.user_id);
              console.log(this.apiService.getUserId());
              console.log("-----------------");
             
              if(this.apiService.getUserId()!=x.ultimo_mensaje.user_id){
               // x.descripcion=x.otherUser.theuser.name+": ha enviado un PDF";
                x.descripcion = this.translate.instant('pnchats.{{nombreUsuario}}: ha enviado un PDF', { nombreUsuario: x.otherUser.theuser.name });
              }
              else{
               //x.descripcion="Tú: has enviado un PDF";
               x.descripcion = this.translate.instant('pnchats.Tú: has enviado un PDF');
              }
            }
            else if(x.ultimo_mensaje.audiobase64!=null){
             
              console.log("DATOS IDS:");
              console.log(x.otherUser.user_id);
              console.log(this.apiService.getUserId());
              console.log("-----------------");
             
              if(this.apiService.getUserId()!=x.ultimo_mensaje.user_id){
               // x.descripcion=x.otherUser.theuser.name+": ha enviado un AUDIO";
                x.descripcion = this.translate.instant('pnchats.ha enviado un AUDIO', { name: x.otherUser.theuser.name });
              }
              else{
                //x.descripcion="Tú: has enviado un AUDIO";
                x.descripcion = this.translate.instant('pnchats.Tú: has enviado un AUDIO');
              }
            }
            else if(x.ultimo_mensaje.imagen!=null){
              console.log("DATOS IDS:");
              console.log(x.otherUser.user_id);
              console.log(this.apiService.getUserId());
              console.log("-----------------");
              if(this.apiService.getUserId()!=x.ultimo_mensaje.user_id){
              //  x.descripcion=x.otherUser.theuser.name+": ha enviado una imagen";
                x.descripcion = this.translate.instant('pnchats.ha enviado una imagen', { name: x.otherUser.theuser.name });
              }
              else{
                //x.descripcion="Tú: has enviado una imagen";
                x.descripcion = this.translate.instant('pnchats.Tú: has enviado una imagen');
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
               // x.descripcion="Tú: "+x.ultimo_mensaje.texto;
                x.descripcion = this.translate.instant('pnchats.Tú: {{mensaje}}', { mensaje: x.ultimo_mensaje.texto });
              }
            }

              
          }
          else
          x.descripcion = this.translate.instant('pnchats.Sin mensajes aún');
            //x.descripcion = "Sin mensajes aún";
          if (x.ultimo_mensaje){
            x.ultimo_mensaje = x.ultimo_mensaje.created_at;
          }
          else
            x.ultimo_mensaje = Date.now();
          return x;
        }
        
        );
       // this.utilities.dismissLoading();
        //console.log(this.chats);
        this.filtChats=this.chats;

        if(this.filtroChat && this.filtroChat.trim() !== "") {
          this.aplicarFiltro();
        }
          if(!this.platform.is('ios') && !this.platform.is('android')){

            //this.obtenerMensajesNuevos();
          }
         //this.utilities.dismissLoading();
         setTimeout(() => {
        //  this.utilities.dismissLoading();
      }, 1000);
      }, error => {
        setTimeout(() => {
          console.log("");
         // this.utilities.dismissLoading();
      }, 1000);
        console.log(error);
        this.isLoading = false;
        this.utilities.showToast(this.translate.instant("pnchats.No se pueden obtener los chats"));
      });
    })
    setTimeout(() => {
      console.log("otro dismiss");
      //this.utilities.dismissLoading();
  }, 1000);
  }


  public async salirseChat(chat: Chat) {

    let text1=this.translate.instant("pnchats.Borrar chat");
    let text2=this.translate.instant("pnchats.¿Quieres borrar el chat ");
    let text3=this.translate.instant("pnchats.Cancelar");
    let text4=this.translate.instant("pnchats.Aceptar");
    let text5=this.translate.instant("pnchats.Borrando chat");
    let text6=this.translate.instant("pnchats.No se ha podido borrar el chat");
    


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
            //this.utilities.showLoading(text5);
            this.isChargeLoading=true;

            this.apiService.deleteSubEntity('chats', chat.id, 'unirse', 1).subscribe((res) => {
             // console.log(res);
             this.isChargeLoading=false;

             // this.utilities.dismissLoading();
              this.getChats();
            }, error => {
              console.log(error);
              this.isChargeLoading=false;

              //this.utilities.dismissLoading();
              this.utilities.showToast(text6);
            });
          }
        }
      ]
    });

    await alert.present();

  }



  goPNChat($arg1,$arg2,$arg3,$arg4,$arg5=null,$arg6){
    console.log($arg1);
    console.log($arg2);
    console.log($arg3);
    console.log($arg4);
    console.log($arg5);
    console.log($arg6);

    this.navCtrl.navigateForward('interior-pnchat', { state: { id_chat:$arg1,nombre_chat:$arg2,ultimo_mensaje:$arg3,avatar:$arg4,telNumber: $arg5,userId:$arg6} });
  }

  goPGChat($arg1,$arg2,$arg3,$arg4,$arg5=null,$arg6){
    console.log($arg1);
    console.log($arg2);
    console.log($arg3);
    console.log($arg4);
    console.log($arg5);
    console.log($arg6);

    this.navCtrl.navigateForward('interior-pgchat', { state: { id_chat:$arg1,nombre_chat:$arg2,ultimo_mensaje:$arg3,avatar:$arg4,telNumber: $arg5,userId:$arg6} });
  }


  voldemort2(){
    

    this.navCtrl.navigateRoot('interior-chat');
  }




  aplicarFiltro(){
    /*console.log('Nuevo valor del input:', this.filtroChat);
    //this.filtChats=this.chats;
    this.filtChats = this.chats.filter(chat => chat?.otherUser?.theuser?.name.includes(this.filtroChat));
    console.log(this.chats.filter(chat => chat?.otherUser?.theuser?.name.includes(this.filtroChat)));*/


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




   

   this.pgfiltChats = this.pgchats.filter(pgchats => {
    // Obtener el nombre del usuario en minúsculas para comparación
    const nombreEnMinusculas = pgchats?.name?.toLowerCase();
    
    // Verificar si el nombre en minúsculas incluye el filtro en minúsculas
    return nombreEnMinusculas?.includes(filtroEnMinusculas);
    });



  }




  /*obtenerMensajesNuevos(){

    this.webInterval=setInterval(() => {
     // console.log('actualizar');

      //---------------------

      
      this.apiService.getEntity('chats').subscribe((chats: Chat[]) => {
       
        this.webChats = chats.map(x => {
          x.avatar=x.otherUser.theuser.avatar;
          //console.log(x.avatar);
          if (x.ultimo_mensaje)
            x.descripcion = x.ultimo_mensaje.texto;
          else
            x.descripcion = "Sin mensajes aún";
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
       
        this.utilities.showToast("No se pueden obtener los chats");
      });

    
    

      //--------------------
    }, 2500);
  }*/

  ngOnDestroy() {

    if(!this.platform.is('ios') && !this.platform.is('android')){
     // clearInterval(this.webInterval);
    }

    if (this.keyboardListener) {
      this.keyboardListener.remove();
      console.log('Listener de teclado eliminado ✅');
      this.keyboardListener=null;
    }
        
  }












  showOptionPage($opc){
    
    this.divOption=$opc
   // console.log(this.divOption);

  }


/*
  public obtainUserRequests(){//getSimilarCourses

    this.ngZone.run(() => {
    
    
    this.chatRequests= [];
    this.filtChatRequests= [];


   
    
    this.apiService.obtainUserRequests({}).subscribe((result) => {
      //console.log('DATOS',result);
      this.chatRequests=result;
      this.filtChatRequests=this.chatRequests;

      if(this.filtroChat && this.filtroChat.trim() !== "") {
        this.aplicarFiltro();
      }
      
    }, error => {
      this.utilities.showToast('Hubo un problema al obtener los vehiculos');
      console.log(error);
    });
  })
  }*/




  public getGroupChats(): void {
    //this.utilities.showLoading('');
    this.ngZone.run(() => {
          //aqui mi amorr
          console.log("ENTRO AQUI PARA CARGAR EL LOADING");
          
          this.isLoading = true;
      



          console.log("EL ID DE PROYECTO: ");
          console.log(this.projectId);

          
          
      this.apiService.getPgChats({projectId:this.projectId, language_code:this.language_code}).subscribe((pgchats: Chat[]) => {
        this.isLoading = false;
        setTimeout(() => {
          //this.utilities.dismissLoading();
      }, 1000);
        console.log("GRUPO");
        console.log(pgchats);
        this.pgchats = pgchats.map(x => {

          if(x.otherUser!=null){

            console.log('mensaje nuevos>>');
            console.log(x?.mensajes_nuevos);
            if(x?.mensajes_nuevos>0){
              this.newGroupChat=true;
            }
            x.avatar=x.otherUser.theuser.avatar;
          
            if (x.ultimo_mensaje){

            
            console.log(x);
            console.log(x.ultimo_mensaje);
            if(x.ultimo_mensaje.pdfbase64!=null){
             
              console.log("DATOS IDS:");
              console.log(x.otherUser.user_id);
              console.log(this.apiService.getUserId());
              console.log("-----------------");
             
              if(this.apiService.getUserId()!=x.ultimo_mensaje.user_id){
                //x.descripcion=x.otherUser.theuser.name+": ha enviado un PDF";
                x.descripcion = this.translate.instant('pnchats.{{nombreUsuario}}: ha enviado un PDF', { nombreUsuario: x.otherUser.theuser.name });
              }
              else{
               // x.descripcion="Tú: has enviado un PDF";
               x.descripcion = this.translate.instant('pnchats.Tú: has enviado un PDF');
              }
            }
            else if(x.ultimo_mensaje.audiobase64!=null){
             
              console.log("DATOS IDS:");
              console.log(x.otherUser.user_id);
              console.log(this.apiService.getUserId());
              console.log("-----------------");
             
              if(this.apiService.getUserId()!=x.ultimo_mensaje.user_id){
               // x.descripcion=x.otherUser.theuser.name+": ha enviado un AUDIO";
               x.descripcion = this.translate.instant('pnchats.ha enviado un AUDIO', { name: x.otherUser.theuser.name });
              }
              else{
               // x.descripcion="Tú: has enviado un AUDIO";
                x.descripcion = this.translate.instant('pnchats.Tú: has enviado un AUDIO');
              }
            }
            else if(x.ultimo_mensaje.imagen!=null){
              console.log("DATOS IDS:");
              console.log(x.otherUser.user_id);
              console.log(this.apiService.getUserId());
              console.log("-----------------");
              if(this.apiService.getUserId()!=x.ultimo_mensaje.user_id){
               //x.descripcion=x.otherUser.theuser.name+": ha enviado una imagen";
                x.descripcion = this.translate.instant('pnchats.ha enviado una imagen', { name: x.otherUser.theuser.name });
              }
              else{
                //x.descripcion="Tú: has enviado una imagen";
                x.descripcion = this.translate.instant('pnchats.Tú: has enviado una imagen');
              }
            }
            else{
              console.log("DATOS IDS:");
              console.log(x.otherUser.user_id);
              console.log(this.apiService.getUserId());
              console.log("-----------------");

              if(this.apiService.getUserId()!=x.ultimo_mensaje.user_id){
               // x.descripcion=x.otherUser.theuser.name+": "+x.ultimo_mensaje.texto;
               x.descripcion=x.otherUser.theuser.name+": "+x.ultimo_mensaje.texto;
              
              }
              else{
                //x.descripcion="Tú: "+x.ultimo_mensaje.texto;
                x.descripcion = this.translate.instant('pnchats.Tú: {{mensaje}}', { mensaje: x.ultimo_mensaje.texto });
              }
            }

              
          }
          else{
           //x.descripcion = "Sin mensajes aún";
           x.descripcion = this.translate.instant('pnchats.Sin mensajes aún');
          }
          }
          if (x.ultimo_mensaje){
            x.ultimo_mensaje = x.ultimo_mensaje.created_at;
          }
          else
            x.ultimo_mensaje = Date.now();
          return x;
        }
      
      
        );
        //console.log(this.chats);
        this.pgfiltChats=this.pgchats;

        if(this.filtroChat && this.filtroChat.trim() !== "") {
          this.aplicarFiltro();
        }
          if(!this.platform.is('ios') && !this.platform.is('android')){

            //this.obtenerMensajesNuevos();
          }
      }, error => {
        setTimeout(() => {
          this.isChargeLoading=false;

         // this.utilities.dismissLoading();
      }, 1000);
        console.log(error);
        this.isLoading = false;
        this.utilities.showToast("pnchats.No se pueden obtener los chats");
      });
      setTimeout(() => {
        console.log("el dismiss");
        this.isChargeLoading=false;

        //this.utilities.dismissLoading();
    }, 1000);
    })
  }





  //------------------------------------------------

    
    
    
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

  async abrirModalCreateChat(){

    
    const modal = await this.modalCtrl.create({
      component: CreatePnchatModalPage,
      cssClass: 'listParticipantsModal',
      componentProps: {
        projectId: this.projectId,
      },
    });


    modal.onDidDismiss().then((result) => {
      // const selectedNetwork = data.data?.selectedNetwork;
      const data = result.data;

    if (data?.isChatCreated) {
      console.log('✅ Chat creado desde el modal');
     // this.utilities.showToast('Se creó un chat con éxito');
      // podés refrescar lista o navegar, etc.
      this.getChats(); // <- si tenés una función así
    } else {
      console.log('❌ Modal cerrado sin crear chat');
    }
       
 
     
     
 
 
 
     });
    return await modal.present();
  }
    
  


  















































  goNewProjectGroup(){
    this.navCtrl.navigateForward('add-participants-to-group', { state: { projectId:this.projectId} });
  }
  
    

  
  onEnterPress(event: KeyboardEvent) {
    // Verificar si la tecla presionada es Enter
    if (event.key === 'Enter') {
      console.log("Se pulsó Enter");
      Keyboard.hide();  // Cierra el teclado en dispositivos móviles
      console.log("///");
      //this.aplicarFiltro();
    }
    
  }


  onSearchClear() {
    console.log("Se pulsó la X, limpiando búsqueda.");
    this.filtroChat = ''; // Limpia la variable vinculada
    this.aplicarFiltro();
  }


  

  async onAjusteClicked(chatId: number) {
    console.log('ID del chat al hacer clic en ajustes:', chatId);
    // Aquí puedes abrir un modal, redirigir, etc.
    
    const modal = await this.modalCtrl.create({
    component: SelectMenuChatPage,
    cssClass: 'SelectModal',
    componentProps: {
    
                  
    },
    // backdropDismiss:false
    });
          
    modal.onDidDismiss().then((data) => {
    // const selectedNetwork = data.data?.selectedNetwork;
    const selectedOption = Number(data.data.selectedOption); 
    console.log('Opcion de usuario devuelta:', selectedOption);
   
    if(selectedOption==1){//
      //this.openJobImageCropper();
      this.adjuntarImagen(chatId);
    }
    else if(selectedOption==2){//
      this.mostrarAlertaBorrado(chatId, 0);     
    }
    else{
      console.log("cancelada");
    }
  });
  return await modal.present();
            
    
  }





  async mostrarAlertaBorrado($id, slidingItem: any) {

      const toastMensaje = await this.translate.get("¿Desea eliminar el chat grupal?").toPromise();
      const toastMensaje2 = await this.translate.get("my-jobs.No").toPromise();
      const toastMensaje3 = await this.translate.get("my-jobs.Sí").toPromise();
      
      const alert = await this.alertCtrl.create({
        //header:'Acceso denegado',
        message: toastMensaje,
        cssClass: 'custom-button-class',
        buttons: [
          {
            text: toastMensaje2,
            role: 'cancel',
            cssClass: 'custom-button-class',
            handler: () => {
              console.log('Clic en Cancelar');
              if (slidingItem) {
                slidingItem.close();
              }
            }
          },
          {
            text: toastMensaje3,
            cssClass: 'custom-button-class',
            handler: () => {
              console.log('Clic en Aceptar');

              this.apiService.deletePGChat({id:$id}).subscribe((result) => {

                console.log(result);
                console.log(result['state']);

                if(result['state']=="CHAT_DELETED"){
                  console.log('ENTRO EN DELETED');
                  
                  this.pgchats = this.pgchats.filter(pgchat => pgchat.id !== $id);
                  this.pgfiltChats = this.pgfiltChats.filter(chat => chat.id !== $id);

                }
                else if(result['state']=="CHAT_NOT_EXIST"){
                  this.pgchats = this.pgchats.filter(pgchat => pgchat.id !== $id);
                   this.pgfiltChats = this.pgfiltChats.filter(chat => chat.id !== $id);
                }
                else{

                }
              }, 
              async error => {
                const toastMensaje = await this.translate.get("my-jobs.Hubo un problema al borrar").toPromise();
              // this.utilities.showToast('Hubo un problema al borrar');
                this.utilities.showToast(toastMensaje); 
                console.log(error);
              });

            },
            //cssClass: 'custom-button-class' 
          }
        ],
        backdropDismiss:false
      });

      await alert.present();
    }



    public async adjuntarImagen($chatId) {

    const permissions = await Camera.requestPermissions();


    if(permissions.photos === 'denied' || permissions.camera === 'denied') {
      console.log("permiso camera " , permissions);
      
    }
    const image = await Camera.getPhoto({
      promptLabelHeader: 'Fotos',
      promptLabelCancel: 'Cancelar',
      promptLabelPhoto: 'Galería',
      promptLabelPicture: 'Cámara',
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64
    });
  
    console.log(image);
    
    // image.webPath will contain a path that can be set as an image src.
    // You can access the original file using image.path, which can be
    // passed to the Filesystem API to read the raw data of the image,
    // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
    this.base64img = 'data:image/jpeg;base64,' + image.base64String;
  
    console.log("imagen " ,this.base64img);

    this.form.patchValue({image : this.base64img});
    this.form.patchValue({chatId : $chatId});
    

    this.apiService.updatePGChatImage(this.form.value).subscribe((result) => {
      console.log(result);
      if (result['state'] === 'UPDATED') {


        const pgc = this.pgchats.find((u) => u.id === $chatId);
        if (pgc) {
          
          pgc.urlImagen=result['nuevoContenido']['urlImagen'];
        }

        const pgc2 = this.pgfiltChats.find((u) => u.id === $chatId);
        if (pgc2) {
         
          pgc2.urlImagen=result['nuevoContenido']['urlImagen'];
        }
        this.utilities.showToast(this.translate.instant("Imagen cambiada correctamente"));


        this.form.patchValue({image : ''});
        this.form.patchValue({chatId : ''});
        this.base64img =null;


      }
      else if(result['state'] === 'NOT_FOUND'){

        this.pgchats = this.pgchats.filter(pgchat => pgchat.id !== $chatId);
        this.pgfiltChats = this.pgfiltChats.filter(chat => chat.id !== $chatId);

        this.utilities.showToast(this.translate.instant("Ese grupo ya no existe"));
        

      }
    }, (error) => {
      this.isChargeLoading=false;
      //this.utilities.dismissLoading();
      this.utilities.showToast(this.translate.instant(codeErrors(error)));
    });


  


    //this.rutaImagen = this.base64img;

    // Can be set to the src of an image now
    //imageElement.src = imageUrl;
  }
  


  async mostrarAlertaBorradoPnChat($id, slidingItem: any) {
    

      const toastMensaje = await this.translate.get("¿Desea eliminar el chat?").toPromise();
      const toastMensaje2 = await this.translate.get("my-jobs.No").toPromise();
      const toastMensaje3 = await this.translate.get("my-jobs.Sí").toPromise();
      
      const alert = await this.alertCtrl.create({
        //header:'Acceso denegado',
        message: toastMensaje,
        cssClass: 'custom-button-class',
        buttons: [
          {
            text: toastMensaje2,
            role: 'cancel',
            cssClass: 'custom-button-class',
            handler: () => {
              console.log('Clic en Cancelar');
              if (slidingItem) {
                slidingItem.close();
              }
            }
          },
          {
            text: toastMensaje3,
            cssClass: 'custom-button-class',
            handler: () => {
              console.log('Clic en Aceptar');

              this.apiService.deletePNChat({id:$id}).subscribe((result) => {

                console.log(result);
                console.log(result['state']);

                if(result['state']=="CHAT_DELETED"){
                  console.log('ENTRO EN DELETED');
                  
                  this.chats = this.chats.filter(pnchat => pnchat.id !== $id);
                  this.filtChats = this.filtChats.filter(chat => chat.id !== $id);

                }
                else if(result['state']=="CHAT_NOT_EXIST"){
                  this.chats = this.chats.filter(pgchat => pgchat.id !== $id);
                  this.filtChats = this.filtChats.filter(chat => chat.id !== $id);
                }
                else{

                }
              }, 
              async error => {
                const toastMensaje = await this.translate.get("my-jobs.Hubo un problema al borrar").toPromise();
              // this.utilities.showToast('Hubo un problema al borrar');
                this.utilities.showToast(toastMensaje); 
                console.log(error);
              });

            },
            //cssClass: 'custom-button-class' 
          }
        ],
        backdropDismiss:false
      });

      await alert.present();
    }





  FullSwipeDelete($pnchat, slidingItem: any){
    this.mostrarAlertaBorradoPnChat($pnchat.id, slidingItem);
  }
  delete($pnchat, slidingItem: any){
    this.mostrarAlertaBorradoPnChat($pnchat.id, slidingItem);
  }

  FullSwipeDelete2($pgchat, slidingItem: any){
    this.mostrarAlertaBorrado($pgchat.id, slidingItem);
  }
  delete2($pgchat, slidingItem: any){
    this.mostrarAlertaBorrado($pgchat.id, slidingItem);
  }

   closeAllSlides() {
    if (this.slidingItems) {
      this.slidingItems.forEach(slidingItem => {
        slidingItem.close();
      });
    }
  }

  onContentClick(event: Event) {
    // Verificar si el clic no fue en un botón de slide o en el área de deslizamiento
    const target = event.target as HTMLElement;
    
    // Si el clic no fue en un botón de opciones del slide, cerrar todos los slides
    if (!target.closest('ion-item-options') && !target.closest('ion-item-option')) {
      this.closeAllSlides();
    }
  }
}

