import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Mensaje } from 'src/app/models/Mensaje';
import { ApiService } from 'src/app/services/api.service';
import { NotificacionesNuevasService } from 'src/app/services/notificaciones-nuevas.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import WaveSurfer from 'wavesurfer.js';
import {InfiniteScrollCustomEvent } from '@ionic/angular';
import { IonContent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { AlertController, NavController, Platform } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';

import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, tap, filter, map } from 'rxjs';

@Component({
  selector: 'app-interior-pgchat',
  templateUrl: './interior-pgchat.page.html',
  styleUrls: ['./interior-pgchat.page.scss'],
})


export class InteriorPgchatPage implements OnInit {


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

  private isFetching: boolean = false;  // Estado para evitar múltiples llamadas de carga simultáneas

  public language_code:string='en';

  public loadingMessage:string='';

  public myUserId:any=-1;

  isChargeLoading:boolean=false;


  constructor( private api:ApiService,
    private http: HttpClient,private router: Router,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private translate: TranslateService,
    private notificacionesService: NotificacionesNuevasService,
    private navCtrl: NavController,
    private cdr: ChangeDetectorRef,
    private platform: Platform,
    private alertController: AlertController,private zone:NgZone,) { 

      this.isLoading = true;

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

    this.idChat = history.state.id_chat;
    this.chatName = history.state.nombre_chat;
    this.lastMessage = history.state.ultimo_mensaje;
    this.avatar=history.state.avatar;//--------
    this.chat_id=this.idChat;
    console.log("------------chatName");
    console.log(this.chatName);

    this.utilities.getUserId().then((result) => {
      this.myUserId=result;
    });
    }

  



    switchLanguage(language: string) {
      this.translate.use(language); // Cambiar el idioma en el servicio de traducción
      this.language_code=language;
      this.loadingMessage = this.translate.instant('interior-pgchat.Cargando mensajes...');
      this.getMensajes();
    }



    public ionViewDidEnter():void{

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
      
  

      this.notificacionesService.getObservable().subscribe((mensaje) => {
        console.log("🔔 NOTIFICACIÓN DE CHATS RECIBIDA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");


        this.zone.run(async () => {
            //this.utilities.showToast(this.router.url);
            const currentUrl = (this.router.url || '').toLowerCase();
           // console.log("🌐 URL actual después de volver:", currentUrl);
            //this.utilities.showToast(currentUrl);
            if (currentUrl!='/interior-pgchat'){
              return;
            }

        const tipoNotificacion = mensaje?.data?.tipoNotificacion;
        console.log("el tipo de notificacion: ",tipoNotificacion);
        if(tipoNotificacion === 'PGChatMessDeleteNotificacion'){
          const chatIdNotificacion = parseInt(mensaje?.data?.chatId);
          const messageId = parseInt(mensaje?.data?.messId);
          if(chatIdNotificacion === this.idChat){
            this.messages = this.messages.filter(msg => msg.id !== messageId);
            console.log(`🧹 Mensaje con ID ${messageId} eliminado del chat ${chatIdNotificacion}`);
            this.cdr.detectChanges();
          }

          return;
        }
      
        // Parsear correctamente el mensaje recibido
        this.messagesData = typeof mensaje === 'string'
          ? JSON.parse(mensaje)
          : mensaje.data?.mensaje
          ? JSON.parse(mensaje.data.mensaje)
          : mensaje;
      
        console.log('--->', this.messagesData);
        console.log('🆔 ID desde data.id:', mensaje.data?.id);
        console.log('📦 CHAT ID MENSAJE NOTIFICACIÓN:', this.messagesData?.chat_id || this.messagesData?.pg_chat_id);
        console.log('📦 MY CHAT ID:', this.idChat);
      
        // Obtener el chatId de forma compatible
        const mensajeChatId = Number(this.messagesData?.pg_chat_id || this.messagesData?.chat_id || mensaje.data?.id);
      
        // ✅ Verificar si es para el chat actual
        if (mensajeChatId === this.idChat) {
          console.log('---> Mensaje pertenece a este chat');
      
          // 🔥 Obtener el ID del mensaje desde diferentes posibles claves
          const mensajeId = Number(this.messagesData?.mensaje_id) || Number(this.messagesData?.id) || Number(mensaje.data?.mensaje_id);
          console.log("📌 ID del mensaje recibido:", mensajeId);
      
          if (!mensajeId || isNaN(mensajeId)) {
            console.log("🚨 ERROR: El mensaje no tiene un ID válido, no se añadirá.");
            return;
          }
      
          // ✅ Verificar si el mensaje ya está en la lista
          const mensajeExistente = this.messages.some(msg => Number(msg.id) === mensajeId);
          console.log("🧐 ¿El mensaje ya está en la lista?:", mensajeExistente);
      
          if (mensajeExistente) {
            console.log("⏩ El mensaje ya estaba en la lista, no se añadió nuevamente.");
            // this.utilities?.showToast?.("Mensaje duplicado ignorado.");
            return;
          }
      
          this.ngZone.run(() => {
            // Obtener archivos o contenido multimedia si existen
            let imageUrl = this.messagesData?.urlimagen;
            let audioUrl = this.messagesData?.urlarchiveaudio;
            let pdfData = this.messagesData?.pdfdata;
            let pdfUrl = this.messagesData?.archive;
      
            console.log('🖼️ Image URL:', imageUrl);
            console.log('🎧 Audio URL:', audioUrl);
            console.log('📄 PDF data:', pdfData);
            console.log('📎 Archive (PDF URL):', pdfUrl);
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      
            const m: Mensaje = {
              id: mensajeId,
              texto: this.messagesData?.texto || this.messagesData?.archive || '[Mensaje recibido]',
              user_name: mensaje.title || this.messagesData?.user_name,
              created_at: this.messagesData?.created_at,
              imagen: imageUrl,
              urlImagen: imageUrl,
              urlarchiveaudio: audioUrl,
              pdfdata: pdfData,
              urlarchive: pdfUrl,
              archive: mensaje?.archive,
              pdfbase64: this.messagesData?.pdfbase64 || null,
              audiobase64: this.messagesData?.audiobase64 || null,
              avatar: this.messagesData?.avatar,
              language_code: this.language_code,
            };
      
            console.log("📬 MENSAJE A INSERTAR:", m);
      
            this.lastMessage = m.created_at;
            this.messages.push(m);
      
            // 🧽 Eliminar mensajes nuevos del chat actual
            this.apiService.deleteEntity('mensajesPGNuevos', this.idChat).subscribe(
              (res) => {
                console.log("🗑️ Mensajes nuevos eliminados:", res);
              },
              (error) => {
                console.log("❌ Error al eliminar mensajes nuevos:", error);
              }
            );
      
            // 📜 Hacer scroll al final del chat
            this.content.scrollToBottom(300);
          });
        }

        });
      });
      

      
      //el primero que me paso
     /* this.notificacionesService.getObservable().subscribe((mensaje) => {
        console.log("🔔 NOTIFICACIÓN DE CHATS RECIBIDA >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      
        // Parsear correctamente el mensaje recibido
        this.messagesData = typeof mensaje === 'string'
          ? JSON.parse(mensaje)
          : mensaje.data?.mensaje
          ? JSON.parse(mensaje.data.mensaje)
          : mensaje;
      
        console.log('--->', this.messagesData);
        console.log('🆔 ID desde data.id:', mensaje.data?.id);
        console.log('📦 CHAT ID MENSAJE NOTIFICACIÓN:', this.messagesData?.chat_id || this.messagesData?.pg_chat_id);
        console.log('📦 MY CHAT ID:', this.idChat);
      
        // Compatibilidad con diferentes claves de ID
        const mensajeChatId = Number(this.messagesData?.pg_chat_id || this.messagesData?.chat_id || mensaje.data?.id);
      
        // Solo procesar si el mensaje es para este chat
        if (mensajeChatId === this.idChat) {
          console.log('---> Mensaje pertenece a este chat');
      
          this.ngZone.run(() => {
            // Obtener archivos o contenido multimedia si existen
            let imageUrl = this.messagesData?.urlimagen;
            let audioUrl = this.messagesData?.urlarchiveaudio;
            let pdfData = this.messagesData?.pdfdata;
            let pdfUrl = this.messagesData?.archive;
      
            console.log('🖼️ Image URL:', imageUrl);
            console.log('🎧 Audio URL:', audioUrl);
            console.log('📄 PDF data:', pdfData);
            console.log('📎 Archive (PDF URL):', pdfUrl);
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      
            const m: Mensaje = {
              id: this.messagesData?.id || this.messagesData?.mensaje_id,
              texto: this.messagesData?.texto || this.messagesData?.archive || '[Mensaje recibido]',
              user_name: mensaje.title || this.messagesData?.user_name,
              created_at: this.messagesData?.created_at,
              imagen: imageUrl,
              urlarchiveaudio: audioUrl,
              pdfdata: pdfData,
              urlarchive: pdfUrl,
              archive: mensaje?.archive,
              pdfbase64: this.messagesData?.pdfbase64 || null,
              audiobase64: this.messagesData?.audiobase64 || null,
              avatar: this.messagesData?.avatar,
              language_code: this.language_code,
            };
      
            setTimeout(() => {
              this.lastMessage = m.created_at;
              this.messages.push(m);
      
              // 🧹 Limpiar mensajes nuevos en este chat
              this.apiService.deleteEntity('mensajesPGNuevos', this.idChat).subscribe(
                (res) => {
                  console.log("🧽 Mensajes nuevos eliminados:", res);
                },
                (error) => {
                  console.log("❌ Error al eliminar mensajes nuevos:", error);
                }
              );
      
              // 📜 Hacer scroll al final del chat
              this.content.scrollToBottom(300);
            }, 1000);
          });
        }
      });*/
      
      
  
      //este es el por defecto
      /*this.notificacionesService.getObservable().subscribe((mensaje)=>{
        console.log('>>>>>>>>>>>>',mensaje);
      //console.log(mensaje?.data?.mensaje);
      this.messagesData=JSON.parse(mensaje.data.mensaje)
      console.log('--->',this.messagesData);
      console.log('odio mi vida',mensaje.data.id);
      console.log('CHAT ID MENSAJE NOTIFICACION: ',this.messagesData?.chat_id);
      console.log('MY CHAT ID: ',this.idChat);

      if(this.messagesData?.chat_id==this.idChat || mensaje.data.id==this.idChat ){
        console.log('--->',this.messagesData);


        this.ngZone.run(() => {


          let imageUrl = this.messagesData.urlimagen;

          console.log('Image URL:', imageUrl);
          console.log('audio url',this.messagesData?.urlarchiveaudio);

          console.log('pdfdata: ',this.messagesData?.pdfdata);
          console.log('archive: ',this.messagesData?.archive);

          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
          let m: Mensaje = {
            // id: mensaje.id,
            // texto: mensaje.texto,
            // user_name: mensaje.user_name,
            // created_at: mensaje.created_at,
            // urlImagen: mensaje.urlImagen,
            // avatar: mensaje.avatar,
            id: this.messagesData.mensaje_id,
            texto: this.messagesData.texto,
            user_name: mensaje.title,
            created_at: this.messagesData.created_at,
            imagen: imageUrl,
            urlarchiveaudio:this.messagesData?.urlarchiveaudio,
            pdfdata:this.messagesData?.pdfdata,
            urlarchive:this.messagesData?.archive,
            archive: mensaje?.archive,
            pdfbase64:null,
            audiobase64:mensaje?.audiobase64,
            avatar: this.messagesData?.avatar,
            language_code:this.language_code,
          }
          //console.log(m);
          setTimeout(() => {
            this.lastMessage = m.created_at;
            this.messages.push(m);
  
            //poner funcion para borrar mensajes nuevos
            this.apiService.deleteEntity('mensajesPGNuevos', this.idChat).subscribe(res => {
             // console.log(res);
            }, error => {
              console.log(error);
            })
            this.content.scrollToBottom(300);
          }, 1000);
  
        })
      }
        
      });*/
    
      //------------------------------------------
      
  }
  
  
  public getMensajes(): void {
    
    if(!this.isLoading){
      //this.utilities.showLoading('');
      this.isChargeLoading=true;

    }
    
    //this.apiService.getSubEntity('chats', this.idChat, 'mensajes').subscribe((messages: Mensaje[]) => {
      this.apiService.getPGComentarios({chatId:this.idChat,lastMessageId:this.ultimoMensajeId,language_code:this.language_code }).subscribe((/*messages: Mensaje[]*/result) => {
      console.log('Result',result);
  
      if(!this.isLoading){
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
      this.utilities.showToast("interior-pgchat.No se pueden obtener los mensajes");
    });
     console.log('ANTES--->BORRADO DE MENSAJESNUEVOS PG CHAT ');
    this.apiService.deleteEntity('mensajesPGNuevos', this.idChat).subscribe(res => {
      console.log('BORRADO DE MENSAJESNUEVOS PG CHAT ',res);
    }, error => {
      console.log(error);
    })
  
    if(!this.platform.is('ios') && !this.platform.is('android')){
      this.obtenerPGMensajesNuevos();
  
    }
  
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

  
   /* Enviar mensaje */
   //public sendMessage(message: Mensaje): void {
  public async sendMessage(message: Mensaje): Promise<void> {
  
  
    if (message.texto != "" || message.imagen || message.archive || message.audiobase64 || message.selectedFile) {

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
      }
      //console.log(message);
      
  
  
      this.apiService.addSubEntity('pgchats', this.idChat, 'mensajes', msj).subscribe((mensaje: Mensaje) => {
        
        //console.log(mensaje);
        let aux=mensaje;
        
        if(aux?.response){
          aux.response.avatar=null;
          if(mensaje?.response?.urlimagen!=null && mensaje?.response?.urlimagen!=''){
            console.log("1");
            console.log(mensaje?.response?.urlimagen);
            aux['response']['imagen'] = mensaje?.response?.urlimagen;
            //msj['image'] = mensaje?.response?.urlimagen;
          }
          
          this.messages.push(aux?.response);
        }
        else{
          msj['id'] = mensaje?.response?.id;
          if(mensaje?.response?.urlimagen!=null &&mensaje?.response?.urlimagen!=''){
            msj['image'] = mensaje?.response?.urlimagen;
            console.log("2");
            console.log(mensaje?.response?.urlimagen);
          }
          this.messages.push(msj);
        }
        
        this.lastMessage = msj.created_at;
        this.content.scrollToBottom(300);
      }, error => {
        this.utilities.showToast("interior-pgchat.No se ha podido enviar el mensaje");
        console.log(error);
      });
  
    }
  }
  
  goBack(){
  
    this.router.navigateByUrl('home');
    
    
    this.router.navigateByUrl('tabs/chats');
  }
  
  
  
  obtenerPGMensajesNuevos(){
  
   /* this.webInterval=setInterval(() => {
      console.log('actualizar');
  
      //---------------------
  
      
      this.apiService.obtenerPGMensajesNuevos({idChat:this.idChat}).subscribe((result) => {
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
  
    if(!this.platform.is('ios') && !this.platform.is('android')){
      //clearInterval(this.webInterval);
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

              this.messages = this.messages.filter(msg => msg.id != messageId);
              
              //this.utilities.showLoading('');
              //this.isChargeLoading=true;

              this.apiService.deletePGChatMessage({messageId:messageId}).subscribe((result) => {

               // setTimeout(() => {
                 // this.utilities.dismissLoading();
                 // this.isChargeLoading=false;

                //}, 500); 
                this.messages = this.messages.filter(msg => msg.id != messageId);
                //this.utilities.showToast("Mensaje eliminado del chat");
              }, async error => {
                const toastMensaje = await this.translate.get("No se pudo borrar el mensaje").toPromise();
                //setTimeout(() => {
                //this.utilities.dismissLoading();
                //this.isChargeLoading=false;

              //}, 500); 
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

}
