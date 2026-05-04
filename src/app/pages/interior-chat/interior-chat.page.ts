import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Mensaje } from 'src/app/models/Mensaje';
import { ApiService } from 'src/app/services/api.service';
import { NotificacionesNuevasService } from 'src/app/services/notificaciones-nuevas.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { AlertController, NavController, Platform } from '@ionic/angular';
import WaveSurfer from 'wavesurfer.js';
import {InfiniteScrollCustomEvent } from '@ionic/angular';
import { IonContent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE

import { Device } from '@awesome-cordova-plugins/device/ngx';
import { ChangeDetectorRef } from '@angular/core';




import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';


import { VoiceRecorder, RecordingData, GenericResponse } from 'capacitor-voice-recorder';
import { Observable, tap, filter, map } from 'rxjs';

@Component({
  selector: 'app-interior-chat',
  templateUrl: './interior-chat.page.html',
  styleUrls: ['./interior-chat.page.scss'],
})
export class InteriorChatPage implements OnInit {


  public pdfUploadProgress = {
    name: '',
    progress: 0,
    completed: false
  };

  @ViewChild('content', {static: true}) private content: any;

  public messages: Mensaje[]=[];
  public ultimoMensajeId:any=null;
  public messagesData: any;
  public idChat: number;
  public chat_id:number;
  public theChat:any;
  public chatName: string;
  public lastMessage;
  public avatar: string;
  public isLoading: boolean = true;
  public telNumber:any=null;
  public user_id:any=null;
  public firstTime:boolean=true;

  webInterval:any = 0;

  isAndroid: boolean = false;
  isIOS: boolean = false;

  loadingMessage: string;

  private isFetching: boolean = false;  // Estado para evitar múltiples llamadas de carga simultáneas


  public language_code:string='en';
  public myUserId:any=-1;

  isChargeLoading:boolean=false;



  constructor(private api:ApiService,private http: HttpClient,
    private router: Router,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private notificacionesService: NotificacionesNuevasService,
    private navCtrl: NavController,
    private device: Device,
    private platform: Platform,
    private translate: TranslateService,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef
  ) { 

    this.isLoading = true;

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

    this.idChat = history.state.id_chat;
    this.chatName = history.state.nombre_chat;
    this.lastMessage = history.state.ultimo_mensaje;
    this.avatar=history.state.avatar;//--------
    this.chat_id=this.idChat;
    this.telNumber=history.state.telNumber;
    this.user_id=history.state.userId;


    this.utilities.getUserId().then((result) => {
      this.myUserId=result;
    });

  }




  

  

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.language_code=language;
    this.loadingMessage = this.translate.instant('interior-chat.Cargando mensajes...');
    this.getMensajes();
  }
  

  public ionViewWillEnter(){
    this.apiService.deleteEntity('mensajesNuevos', this.idChat).subscribe(res => {
      // console.log(res);
     }, error => {
       console.log(error);
     })
  }

  public ionViewDidEnter():void{
    
    console.log(this.translate.langs.length);
  
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
   
  

   // console.log('--->',this.avatar);
  }
   /* Obtenemos los mensajes y nos suscribimos a las notificaciones push */
   public ngOnInit(): void {
    

   /* this.notificacionesService.getObservable().subscribe((mensaje) => {
      console.log("🔔 NOTIFICACIÓN DE CHAT INTERIOR RECIBIDA");
      console.log('📌 Nº mensajes antes de recibir:', this.messages.length);
      console.log('📩 Notificación recibida:', mensaje);
    
      // Asegurar que el mensaje esté bien parseado
      this.messagesData = JSON.parse(mensaje.data.mensaje || "{}"); // Si no existe, se usa "{}" para evitar errores
    
      if (this.messagesData?.chat_id == this.idChat) {
        console.log('✅ El mensaje pertenece al chat actual:', this.idChat);
    
        this.ngZone.run(() => {
          let imageUrl = this.messagesData.imagen;
    
          console.log('🌟 Image URL:', imageUrl);
          console.log('🎵 Audio URL:', this.messagesData?.urlarchiveaudio);
          console.log('📄 PDF Data:', this.messagesData?.pdfdata);
          console.log('🗂️ Archivo:', this.messagesData?.archive);
          console.log('🔍 ------------------------------');
    
          // 🔥 Cambiar cómo obtenemos el ID
          const parsedMensaje = typeof mensaje.data.mensaje === "string" ? JSON.parse(mensaje.data.mensaje) : mensaje.data.mensaje;
          let messageId = Number(parsedMensaje.id); // Convertimos a número
    
          console.log("📌 ID del mensaje recibido:", messageId);
    
          if (isNaN(messageId)) {
            console.log("🚨 ERROR: El mensaje no tiene ID válido, no se añadirá.");
            return;
          }
    
          let m: Mensaje = {
            id: messageId,
            texto: this.messagesData.texto,
            user_name: mensaje.title,
            created_at: this.messagesData.created_at,
            urlImagen: imageUrl,
            imagen: imageUrl,
            urlarchiveaudio: this.messagesData?.urlarchiveaudio,
            pdfdata: this.messagesData?.pdfdata,
            urlarchive: this.messagesData?.archive,
            archive: mensaje?.archive,
            pdfbase64: null,
            audiobase64: mensaje?.audiobase64,
            avatar: this.messagesData?.avatar,
          };
    
          const mensajeExistente = this.messages.some(msg => Number(msg.id) === messageId);
          console.log("🧐 ¿El mensaje ya está en la lista?:", mensajeExistente);
    
          if (!mensajeExistente) {
            this.lastMessage = m.created_at;
            this.messages.push(m);
    
            console.log("✅ Mensaje añadido correctamente.");
            console.log('📌 Nº mensajes después:', this.messages.length);
    
            // Hacer scroll al final para mostrar el nuevo mensaje
            this.content.scrollToBottom(300);
          } else {
            console.log("⏩ El mensaje ya estaba en la lista, no se añadió nuevamente.");
          }
        });
      } else {
        console.log("🚫 El mensaje no pertenece a este chat, ignorado.");
      }
    });*/




    this.notificacionesService.getObservable().subscribe((mensaje) => {
      console.log("🔔 NOTIFICACIÓN DE CHAT INTERIOR RECIBIDA");
      console.log('📌 Nº mensajes antes de recibir:', this.messages.length);
      console.log('📩 Notificación recibida:', mensaje);

      const tipoNotificacion = mensaje?.data?.tipoNotificacion;
      console.log("el tipo de notificacion: ",tipoNotificacion);
      if(tipoNotificacion === 'ChatMessDeleteNotificacion'){
        const chatIdNotificacion = parseInt(mensaje?.data?.chatId);
       
        const messageId = parseInt(mensaje?.data?.messId);
        console.log(`🧹 MensajeID ${messageId}  chatid ${chatIdNotificacion}`);
       // this.utilities.showToast(`🧹 MensajeID ${messageId}  chatid ${chatIdNotificacion}`);
        if(chatIdNotificacion === this.idChat){
          this.messages = this.messages.filter(msg => msg.id !== messageId);
          console.log(`🧹 Mensaje con ID ${messageId} eliminado del chat ${chatIdNotificacion}`);
          this.cdr.detectChanges();
        }

        return;
      }
  
      // Asegurar que el mensaje esté bien parseado
      this.messagesData = JSON.parse(mensaje.data.mensaje || "{}"); // Si no existe, se usa "{}" para evitar errores
  
      if (this.messagesData?.chat_id == this.idChat) {
          console.log('✅ El mensaje pertenece al chat actual:', this.idChat);
  
          this.ngZone.run(() => {
              let imageUrl = this.messagesData.imagen;
  
              console.log('🌟 Image URL:', imageUrl);
              console.log('🎵 Audio URL:', this.messagesData?.urlarchiveaudio);
              console.log('📄 PDF Data:', this.messagesData?.pdfdata);
              console.log('🗂️ Archivo:', this.messagesData?.archive);
              console.log('🔍 ------------------------------');
  
              // 🔥 Obtener correctamente el ID del mensaje, ya sea desde `id` o `mensaje_id`
              const parsedMensaje = typeof mensaje.data.mensaje === "string" ? JSON.parse(mensaje.data.mensaje) : mensaje.data.mensaje;
              let messageId = Number(parsedMensaje.id) || Number(parsedMensaje.mensaje_id); // Intentamos obtenerlo desde `id`, si no desde `mensaje_id`
  
              console.log("📌 ID del mensaje recibido:", messageId);
  
              if (isNaN(messageId) || !messageId) {
                  console.log("🚨 ERROR: El mensaje no tiene ID válido, no se añadirá.");
                  return;
              }
  
              let m: Mensaje = {
                  id: messageId,
                  texto: this.messagesData.texto,
                  user_name: mensaje.title,
                  created_at: this.messagesData.created_at,
                  urlImagen: imageUrl,
                  imagen: imageUrl,
                  urlarchiveaudio: this.messagesData?.urlarchiveaudio,
                  pdfdata: this.messagesData?.pdfdata,
                  urlarchive: this.messagesData?.archive,
                  archive: mensaje?.archive,
                  pdfbase64: null,
                  audiobase64: mensaje?.audiobase64,
                  avatar: this.messagesData?.avatar,
              };
  
              const mensajeExistente = this.messages.some(msg => Number(msg.id) === messageId);
              console.log("🧐 ¿El mensaje ya está en la lista?:", mensajeExistente);
  
              if (!mensajeExistente) {
                  this.lastMessage = m.created_at;
                  this.messages.push(m);
  
                  console.log("✅ Mensaje añadido correctamente.");
                  console.log('📌 Nº mensajes después:', this.messages.length);
  
                  // Hacer scroll al final para mostrar el nuevo mensaje
                  this.content.scrollToBottom(300);
              } else {
                  console.log("⏩ El mensaje ya estaba en la lista, no se añadió nuevamente.");
              }
          });
      } else {
          console.log("🚫 El mensaje no pertenece a este chat, ignorado.");
      }
  });
  


  
  


    
    
    
    

    
    
  
    //------------------------------------------
    
}


public getMensajes(): void {
  
  if(!this.isLoading){
    //this.utilities.showLoading('');
    this.isChargeLoading=true;

  }
  
  //this.apiService.getSubEntity('chats', this.idChat, 'mensajes').subscribe((messages: Mensaje[]) => {
    this.apiService.getComentarios({chatId:this.idChat,lastMessageId:this.ultimoMensajeId,language_code:this.language_code }).subscribe(async (/*messages: Mensaje[]*/result) => {
    console.log('Result',result);

    if(!this.isLoading){
      await this.esperar(250);
      //this.utilities.dismissLoading();
      this.isChargeLoading=false;

    }
    this.isLoading = false;
    console.log('mensajes nuevos:');
    console.log(result['messages']);
    
    //this.messages = messages;
    let nuevosMensajes = Object.values(result['messages']) as Mensaje[];

    nuevosMensajes.forEach((mensaje) => {
      if (mensaje !== null) {
          this.messages.unshift(mensaje);  // Insertar cada mensaje al principio del array
      }
  });
    
    // Concatenar los nuevos mensajes al principio del array existente
    //this.messages = nuevosMensajes.concat(this.messages); //concadenar mensajes anteriores
    this.ultimoMensajeId=result['ultimoMensajeId'];//añado ultimo id

    console.log(this.messages);
    setTimeout(() => {
      if(this.firstTime){
        this.content.scrollToBottom(1000);
        this.firstTime=false;
      }
    }, 200);
  }, error => {
    this.isLoading = false;
    console.log(error);
    this.translate.get("interior-chat.No se pueden obtener los mensajes").subscribe((translatedText: string) => {
      this.utilities.showToast(translatedText);
    });
  });
 /* this.apiService.deleteEntity('mensajesNuevos', this.idChat).subscribe(res => {
    console.log(res);
  }, error => {
    console.log(error);
  })*/

  if(!this.platform.is('ios') && !this.platform.is('android')){
    this.obtenerMensajesNuevos();

  }

}



public async sendMessage(message: Mensaje): Promise<void> {
  console.log("ENVIA MENSAJE INICIO");

  if (message.texto !== "" || message.imagen || message.archive || message.audiobase64 || message.selectedFile) {
    
    // 1. Si hay PDF, subirlo primero y esperar el resultado
    if (message.selectedFile) {
      try {
        const res = await this.subirPdfConProgreso(message.selectedFile).toPromise();
        message.archive = res.path;
        //message.pdfData = [res.original_name, res.file_size];
        console.log("✅ PDF subido:", res);
        setTimeout(() => {
          this.pdfUploadProgress = { name: '', progress: 0, completed: false };
        }, 1000);
      } catch (error) {
        console.error("❌ Error subiendo PDF:", error);
        this.translate.get("interior-chat.No se ha podido enviar el archivo").subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText);
        });
        setTimeout(() => {
          this.pdfUploadProgress = { name: '', progress: 0, completed: false };
        }, 1000);
        return; // no continúes si falló la subida
      }
    }

    // 2. Armar el mensaje
    const msj: Mensaje = {
      texto: message.texto,
      created_at: Date.now(),
      chat_id: this.idChat,
      imagen: message.imagen,
      archive: message.archive,
      pdfData: message.pdfData,
      audiobase64: message.audiobase64,
      audiodata: message.audiodata,
      language_code: this.language_code,
      idDevice: this.device.uuid,
    };


  
    this.apiService.addSubEntity('chats', this.idChat, 'mensajes', msj).subscribe((mensaje: Mensaje) => {
      console.log("LLEGA MENSAJE INICIO");

      console.log(mensaje);
      console.log("fin datos mensaje");
      let aux=mensaje;
      
      if(aux?.response){
        aux.response.avatar=null;
        this.messages.push(aux?.response);
      }
      else{
        msj['id'] = mensaje?.response?.id;
        this.messages.push(msj);
      }
      
      this.lastMessage = msj.created_at;
      this.content.scrollToBottom(300);
    }, error => {
      this.translate.get("interior-chat.No se ha podido enviar el mensaje").subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
      console.log(error);
    });

  }
}

 /* Enviar mensaje */
 public sendMessagesinprogreso(message: Mensaje): void {

  console.log("ENVIA MENSAJE INICIO");


  if (message.texto != "" || message.imagen || message.archive || message.audiobase64) {

    if(message.selectedFile!=null){

      this.subirPdfConProgreso(message.selectedFile).subscribe((res) => {
        //this.message.archive = res.path; // path desde Laravel
        //this.message.pdfData = [res.original_name, res.file_size];

       
      });

    }


    let msj: Mensaje = {
      texto: message.texto,
      created_at: Date.now(),
      chat_id: this.idChat,
      imagen: message.imagen,
      archive: message.archive,
      pdfData: message.pdfData,
      audiobase64:message.audiobase64,
      audiodata:message.audiodata,
      language_code:this.language_code,
      idDevice:this.device.uuid,
    }
    //console.log(message);
    

  
    this.apiService.addSubEntity('chats', this.idChat, 'mensajes', msj).subscribe((mensaje: Mensaje) => {
      console.log("LLEGA MENSAJE INICIO");

      console.log(mensaje);
      console.log("fin datos mensaje");
      let aux=mensaje;
      
      if(aux?.response){
        aux.response.avatar=null;
        this.messages.push(aux?.response);
      }
      else{
        msj['id'] = mensaje?.response?.id;
        this.messages.push(msj);
      }
      
      this.lastMessage = msj.created_at;
      this.content.scrollToBottom(300);
    }, error => {
      this.translate.get("interior-chat.No se ha podido enviar el mensaje").subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
      console.log(error);
    });

  }
}

goBack(){

  //this.router.navigateByUrl('home');
  this.apiService.deleteEntity('mensajesNuevos', this.idChat).subscribe(res => {
    // console.log(res);
    
   }, error => {
     console.log(error);
   })
   this.apiService.chatUserStatusChanges.next();
  
  this.router.navigateByUrl('tabs/chats');
}









obtenerMensajesNuevos(){

 /* this.webInterval=setInterval(() => {
    console.log('actualizar');

    //---------------------

    
    this.apiService.obtenerMensajesNuevos({idChat:this.idChat}).subscribe((result) => {
      console.log('DATOS',result);
      this.messages = this.messages.concat(result);
     
      this.content.scrollToBottom(300);

    }, error => {
      //this.utilities.showToast('');
      console.log(error);
    });

    //--------------------
  }, 2500);*/
}

ngOnDestroy() {

  this.apiService.chatsChanges.next();

  this.apiService.deleteEntity('mensajesNuevos', this.idChat).subscribe(res => {
    // console.log(res);
    this.apiService.chatUserStatusChanges.next();
   }, error => {
     console.log(error);
     this.apiService.chatUserStatusChanges.next();
   })


   if (this.notificacionesService) {
    this.notificacionesService.remove();
    console.log('notificacionesService en ionViewWillLeave eliminado ✅');
    this.notificacionesService=null;//---
  }
   
   
}

ionViewWillLeave() {
  console.log("Se ejecuta ionViewWillLeave");
  this.apiService.deleteEntity('mensajesNuevos', this.idChat).subscribe(res => {
    // console.log(res);
    this.apiService.chatUserStatusChanges.next();
   }, error => {
     console.log(error);
     this.apiService.chatUserStatusChanges.next();
   })


   if (this.notificacionesService) {
    this.notificacionesService.remove();
    console.log('notificacionesService en ionViewWillLeave eliminado ✅');
    this.notificacionesService=null;//---
  }
   
  
}



 // Este método se ejecutará cada vez que el usuario haga scroll
 onScroll(event: any) {
  // Verifica si el scroll está en la parte superior
  if (event.detail.scrollTop === 0) {


    console.log('Cargando comentarios anteriores');

    if(this.ultimoMensajeId==null || this.ultimoMensajeId!=-1){

      console.log('Buscando comentarios anteriores');
      this.getMensajes();
    }
    


  }
}








  async onLongPress(messageId: any) {
  console.log('Long press detectado en mensaje con ID:', messageId);
  const mensajeSeleccionado = this.messages.find(msg => msg.id === messageId);
//this.myUserId
  if (mensajeSeleccionado) {
    console.log('Mensaje encontrado:', mensajeSeleccionado);
    if(this.myUserId==mensajeSeleccionado.user_id){
      console.log("El mensaje lo escribiste tu");
      const alert = await this.alertController.create({
        header:"",//this.translate.instant('Cerrar sesión'),
        message: this.translate.instant('¿Estás seguro de querer eliminar el mensaje?'),
        cssClass: 'custom-button-class',
        buttons: [
          {
            text: this.translate.instant('Cancelar'),
            role: 'cancel',
            cssClass: 'custom-button-class',
            handler: () => {
              console.log('Clic en Cancelar');
            }
          },
          {
            text: this.translate.instant('Eliminar'),
            cssClass: 'custom-button-class',
            handler: () => {
              console.log('Clic en Aceptar');
              //this.utilities.showLoading('');
              //this.isChargeLoading=true;

              this.apiService.deleteChatMessage({messageId:messageId}).subscribe( (result) => {

                //await this.esperar(250);
                //setTimeout(() => {
                  //this.utilities.dismissLoading();
                 // this.isChargeLoading=false;

                //}, 500); 
                this.messages = this.messages.filter(msg => msg.id != messageId);
                this.utilities.showToast("Mensaje eliminado del chat");
              }, async error => {
                const toastMensaje = await this.translate.get("No se pudo borrar el mensaje").toPromise();
                //setTimeout(() => {
               // this.utilities.dismissLoading();
                //this.isChargeLoading=false;

              //}, 500); 
              //await this.esperar(250);
                this.utilities.showToast(toastMensaje); 
              
                console.log(error);
              });
             
            },
            //cssClass: 'custom-button-class' 
          }
        ]
      });
  
      await alert.present();
    
      
    }

  } else {
    console.warn('Mensaje no encontrado');
  }
}









subirPdfConProgreso0(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('nombre', file.name);
    formData.append('tamano', file.size.toString());
  
    /*return this.http.post('https://tuservidor.com/api/upload-pdf', formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      tap(event => {
        if (event.type === HttpEventType.UploadProgress) {
          let uploadProgress = Math.round(100 * event.loaded / (event.total || 1));
          console.log('Progreso:', uploadProgress + '%');
        }
      }),
      filter(event => event.type === HttpEventType.Response),
      map((event: any) => event.body)
    );*/

  console.log("Cabecera",this.api.httpOptionsFiles.headers);
  console.log("Peticion subida");
    
    return this.http.post('https://in-situ360.com/api/auth/upload-pdf', formData, {
      headers: this.api.httpOptionsFiles.headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      tap(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const uploadProgress = Math.round(100 * event.loaded / (event.total || 1));
          console.log('Progreso:', uploadProgress + '%');
          //this.uploadProgress = uploadProgress;
        }
      }),
      filter(event => event.type === HttpEventType.Response),
      map((event: any) => event.body)
    );
  }



  subirPdfConProgreso(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('nombre', file.name);
    formData.append('tamano', file.size.toString());
  
    this.pdfUploadProgress = {
      name: file.name,
      progress: 0,
      completed: false
    };
  
    return this.http.post('https://in-situ360.com/api/auth/upload-pdf', formData, {
      headers: this.api.httpOptionsFiles.headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      tap(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = Math.round((100 * event.loaded) / (event.total || 1));
          this.pdfUploadProgress.progress = progress;
          console.log('📄 Progreso PDF:', progress + '%');
        }
      }),
      filter(event => event.type === HttpEventType.Response),
      map((event: any) => {
        this.pdfUploadProgress.completed = true;
        return event.body;
      })
    );
  }
  


  async esperar(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Función para obtener el label de fecha (Hoy, Ayer, Viernes 13 de mayo, etc.)
  getDateLabel(dateString: string): string {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Comparar solo las fechas sin horas
    const msgDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (msgDateOnly.getTime() === todayOnly.getTime()) {
      return this.translate.instant('chats.today');
    } else if (msgDateOnly.getTime() === yesterdayOnly.getTime()) {
      return this.translate.instant('chats.yesterday');
    } else {
      // Formato: "Viernes 13 de mayo"
      const dayNames = [
        this.translate.instant('chats.sunday'),
        this.translate.instant('chats.monday'),
        this.translate.instant('chats.tuesday'),
        this.translate.instant('chats.wednesday'),
        this.translate.instant('chats.thursday'),
        this.translate.instant('chats.friday'),
        this.translate.instant('chats.saturday')
      ];
      const monthNames = [
        this.translate.instant('chats.january'),
        this.translate.instant('chats.february'),
        this.translate.instant('chats.march'),
        this.translate.instant('chats.april'),
        this.translate.instant('chats.may'),
        this.translate.instant('chats.june'),
        this.translate.instant('chats.july'),
        this.translate.instant('chats.august'),
        this.translate.instant('chats.september'),
        this.translate.instant('chats.october'),
        this.translate.instant('chats.november'),
        this.translate.instant('chats.december')
      ];
      
      const dayName = dayNames[messageDate.getDay()];
      const day = messageDate.getDate();
      const monthName = monthNames[messageDate.getMonth()];
      
      return `${dayName} ${day} ${this.translate.instant('chats.of')} ${monthName}`;
    }
  }

  // Función para agrupar mensajes por fecha
  getGroupedMessages(): any[] {
    const grouped = [];
    let lastDate: string = null;

    for (const message of this.messages) {
      const msgDateLabel = this.getDateLabel(message.created_at);
      
      if (msgDateLabel !== lastDate) {
        grouped.push({ isDateSeparator: true, dateLabel: msgDateLabel });
        lastDate = msgDateLabel;
      }
      
      grouped.push({ isDateSeparator: false, message });
    }

    return grouped;
  }

}
