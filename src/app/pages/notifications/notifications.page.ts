import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { IonSlides, ModalController, NavController,Platform, AlertController, IonRouterOutlet } from '@ionic/angular';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { ModalFiltTextPage } from '../modal-filt-text/modal-filt-text.page';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE


import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;
  allowGetMore: boolean = true;

  public form: FormGroup;
  public formPending: FormGroup;
  public permissions:any=null;

  public notifications:any=[];
  public notificationsIds: any = [];
  public pendingNotifications: any = [];
  public allnotifications:any=[];

  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------
  isChargeLoading:boolean=true;

  // Bandera para controlar continueGettingUsers
  private shouldContinueGettingUsers: boolean = false;

  showOnlyUnread = false;
  private notificationsBackup: any[] | null = null; // respaldo cuando hay filtro activo

   public totalUsers:number=0;

  constructor(private routerOutlet: IonRouterOutlet,
    public navCtrl: NavController,
    private platform: Platform,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private router: Router,//SEGUIMIENTO DE TIEMPO
    ){ 
      this.isIOS=this.platform.is('ios');
      this.isAndroid=this.platform.is('android');

        this.obtainPreviousPerms();
    

      this.form = new FormGroup({
        notificationsIds: new FormControl(this.notificationsIds),
        language_code: new FormControl('en'),
      });

      this.formPending = new FormGroup({
        pendingNotifications: new FormControl(this.pendingNotifications),
        language_code: new FormControl('en'),
      });

    }

  ngOnInit() {
    this.isChargeLoading=true;
    this.utilities.getLang().then((result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo==null) {
        console.log("No idioma");
        this.utilities.saveLang('en');
  
        
      } else {
        
        this.switchLanguage(prefijo || 'en');
      }
      this.obtainAllUserNotifications();
    });
  }

  ionViewDidEnter() {
    
  this.obtainPreviousPerms();
    
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.form.patchValue({ language_code: language });
    this.formPending.patchValue({ language_code: language });
  }



/*  public obtainAllUserNotifications(){
    this.notifications =[];
    if (!this.showOnlyUnread) {
      this.notificationsBackup = null; // ← solo si NO está activado el filtro
    }     
    this.notificationsIds = [];
    this.form.get('notificationsIds').patchValue(this.notificationsIds);
 

    this.apiService.obtainAllUserNotifications(this.form.value).subscribe((result) => {
      this.isChargeLoading=false;
      console.log('DATOS',result);
      this.notifications=this.notifications.concat(result['notifications']);//concadenar listado vehiculos
      this.notificationsIds=this.notificationsIds.concat(result['notificationsIds']);//añado nuevos ids
      this.form.get('notificationsIds').patchValue(this.notificationsIds);
      if(result['pendingNotifications'] && result['pendingNotifications'].length > 0){
       // this.utilities.showToast("QUEDAN PENDIENTES");
        this.pendingNotifications=result['pendingNotifications'];
        this.formPending.get('pendingNotifications').patchValue(this.pendingNotifications);
        this.obtainPendingNotifications();
      }
      

    }, error => {
     this.isChargeLoading=false;
      this.translate.get('notifications.No se pudo obtener las notificaciones').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });


    console.log('notificaciones: ', this.notifications);
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    

  }*/


 public obtainAllUserNotifications() {

  // Detener cualquier proceso de continueGettingUsers en curso
  this.shouldContinueGettingUsers = false;

  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
  this.isChargeLoading = true;
  this.totalUsers = 0;

  // reset de visibles e ids (el respaldo solo se borra si NO está el filtro activo)
  this.notifications = [];
  if (!this.showOnlyUnread) {
    this.notificationsBackup = null;
  }
  this.notificationsIds = [];
  this.form.get('notificationsIds').patchValue(this.notificationsIds);

  // Activar la bandera para permitir continueGettingUsers
  this.shouldContinueGettingUsers = true;

  this.apiService.obtainAllUserNotifications(this.form.value).subscribe((result) => {
    this.isChargeLoading = false;
    const loaded: any[] = result?.['notifications'] ?? [];
    const ids: any[] = result?.['notificationsIds'] ?? [];
    this.allnotifications=result?.['notifications'] ?? [];

    // aplica o no el filtro según el toggle
    if (this.showOnlyUnread) {
      this.notificationsBackup = [...loaded];                // guarda original
      this.notifications = this.notificationsBackup.filter(n => !n.read); // muestra solo no leídas
    } else {
      this.notificationsBackup = null;                       // sin filtro, no necesitamos respaldo
      this.notifications = loaded;
    }

    this.notificationsIds = ids;
    this.form.get('notificationsIds').patchValue(this.notificationsIds);

    this.totalUsers = result['totalNotifications'];
      //this.totalUsers=this.totalUsers-(result['users']?.length);


      if(this.totalUsers>this.allnotifications.length && this.shouldContinueGettingUsers){
        this.continueGettingUsersNotifications();
      }

    // pendientes traducidas (si las hay)
   /* if (result?.['pendingNotifications']?.length) {
      this.pendingNotifications = result['pendingNotifications'];
      this.formPending.get('pendingNotifications').patchValue(this.pendingNotifications);
      this.obtainPendingNotifications();
    }*/
  }, error => {
    this.isChargeLoading = false;
    this.translate.get('notifications.No se pudo obtener las notificaciones')
      .subscribe((t: string) => this.utilities.showToast(t));
    console.log(error);
  });
}



   continueGettingUsersNotifications(){

    // Verificar si debe continuar
    if (!this.shouldContinueGettingUsers) {
      return;
    }

    this.apiService.obtainAllUserNotifications(this.form.value).subscribe((result) => {
       console.log('nuevas notificaciones', result?.['notifications'].length);
      const more: any[] = result?.['notifications'] ?? [];
      const moreIds: any[] = result?.['notificationsIds'] ?? [];
      this.allnotifications=result?.['notifications'] ?? [];

      // si hay filtro activo (o ya hay respaldo), concatenamos al respaldo y recalculamos la vista
      if (this.showOnlyUnread || this.notificationsBackup) {
        this.notificationsBackup = (this.notificationsBackup ?? []).concat(more);
        this.notifications = this.notificationsBackup.filter(n => !n.read);
      } else {
        // sin filtro: concatenamos directo a la visible
        this.notifications = this.notifications.concat(more);
      }

      this.notificationsIds = this.notificationsIds.concat(moreIds);
      this.form.get('notificationsIds').patchValue(this.notificationsIds);


       this.totalUsers = result['totalNotifications'];
      if(this.totalUsers>this.allnotifications.length && this.shouldContinueGettingUsers){
        this.continueGettingUsersNotifications();
      }


    }, error => {
      this.translate.get('notifications.No se pudo obtener las notificaciones')
        .subscribe((t: string) => this.utilities.showToast(t));
      console.log(error);
    });
   }



  obtainPendingNotifications(){
    this.apiService.obtainPendingNotifications(this.formPending.value).subscribe((result) => {
      const translated = result?.['notifications'] ?? [];

      const updateList = (arr: any[]) => {
        translated.forEach(tn => {
          const i = arr.findIndex(n => n.id === tn.id);
          if (i !== -1) arr[i] = tn;
        });
      };

      if (this.notificationsBackup) {
        updateList(this.notificationsBackup);
        this.notifications = this.notificationsBackup.filter(n => !n.read);
      } else if (this.notifications) {
        updateList(this.notifications);
      }
    }, error => {
      this.translate.get('notifications.No se pudo obtener las notificaciones')
        .subscribe((t: string) => this.utilities.showToast(t));
      console.log(error);
    });
  }






  /*getMoreNotifications() {
    
      console.log('>>>>>>>>>>>>getMoreNotifications>>>>>>>>>>');
        this.apiService.obtainAllUserNotifications(this.form.value).subscribe((result) => {
          console.log('Result2',result);
          
          //this.notifications=this.notifications.concat(result['notifications']);//concadenar listado vehiculos
          this.notificationsIds=this.notificationsIds.concat(result['notificationsIds']);//añado nuevos ids


          if (this.notificationsBackup) {
            this.notificationsBackup = this.notificationsBackup.concat(result['notifications']);
            this.notifications = this.notificationsBackup.filter(n => !n.read);
          } else {
            this.notifications = this.notifications.concat(result['notifications']);
          }


          this.form.get('notificationsIds').patchValue(this.notificationsIds);
          //this.actu=true;
        }, error => {
         
          this.translate.get('notifications.No se pudo obtener las notificaciones').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
          console.log(error);
          //this.actu=true;
          
        });
  }*/

        getMoreNotifications() {
  this.apiService.obtainAllUserNotifications(this.form.value).subscribe((result) => {
    console.log('nuevas notificaciones', result?.['notifications'].length);
    const more: any[] = result?.['notifications'] ?? [];
    const moreIds: any[] = result?.['notificationsIds'] ?? [];

    // si hay filtro activo (o ya hay respaldo), concatenamos al respaldo y recalculamos la vista
    if (this.showOnlyUnread || this.notificationsBackup) {
      this.notificationsBackup = (this.notificationsBackup ?? []).concat(more);
      this.notifications = this.notificationsBackup.filter(n => !n.read);
    } else {
      // sin filtro: concatenamos directo a la visible
      this.notifications = this.notifications.concat(more);
    }

    this.notificationsIds = this.notificationsIds.concat(moreIds);
    this.form.get('notificationsIds').patchValue(this.notificationsIds);
  }, error => {
    this.translate.get('notifications.No se pudo obtener las notificaciones')
      .subscribe((t: string) => this.utilities.showToast(t));
    console.log(error);
  });
}



  selectNotification($not){
    console.log($not);


    
     this.apiService.markNotificationRead({notificationId:$not.id}).subscribe((res) => {
        console.log(res);
        /*$not.read=1;*/
        const updateIn = (arr: any[] | null) => {
      if (!arr) return;
        const i = arr.findIndex(n => n.id === $not.id);
        if (i !== -1) arr[i] = { ...arr[i], read: 1 };
      };

      updateIn(this.notifications);        // visible
      updateIn(this.notificationsBackup);  // respaldo si existe

      // Si está filtrado, desaparecerá de la vista
      if (this.notificationsBackup) {
        this.notifications = this.notificationsBackup.filter(n => !n.read);
      }
        this.apiService.userNotCountChanges.next();
    }, error => {
      console.log(error);
    });


    let decodedData = JSON.parse($not.data);

    // Obtener el id y el tipo de notificación
    let id = decodedData[0].id;
    let tipoNotificacion = decodedData[0].tipoNotificacion;

    // Mostrar los valores en consola
    console.log("ID:", id);
    console.log("Tipo de Notificación:", tipoNotificacion);


    if(tipoNotificacion=='FolderNewNotificacion'){
      this.navCtrl.navigateForward('folder-content', { state: { folderId:id} });
    }
    else if(tipoNotificacion=='ProjectNewNotificacion'){
      this.goProject(id,$not?.user_id);
    }
    else if(tipoNotificacion=='ProjectEndDateNotificacion'){
      this.navCtrl.navigateForward('detail-proyect', { state: { projectId:id} });
    }
    else if(tipoNotificacion=='ProjectNearEndDateNotificacion'){
      this.goProject(id,$not?.user_id);
    }
    else if(tipoNotificacion=='ProjectEndDateNotificacion'){
      this.goProject(id,$not?.user_id);
    }//
    else if(tipoNotificacion=='RatingSentNotificacion'){
     let user_valored_id = decodedData[0].user_valored_id;
     let user_valored_name=decodedData[0].user_valored_name;
      this.goUserRatings(user_valored_id,user_valored_name);
    }
    else if(tipoNotificacion=='ChatNewRequestNotificacion'){
      this.apiService.userRequestsOption.next();
      this.navCtrl.navigateForward('/tabs/chats', { state: { requestNotification:true} });
      
    }
    else if(tipoNotificacion=='ChatAcceptedNotificacion'){


     /* $nuevaNotificacion=Notification::create([
        "title" => 'Tienes un nuevo chat',
        "user_id"=>$theRequest->user_requested_id,
        "description" => 'Se ha creado un nuevo chat con '.$user->name,
        "data" => json_encode([
            [
            "id" => (string) $thechat->id,
            "otherUserId"=>(string) Auth::id(),
            "tipoNotificacion" => 'ChatAcceptedNotificacion',
            ]
        ])
    ]);*/

    let otherUserId = decodedData[0].otherUserId;

      this.apiService.obtainOtherUser({userId: otherUserId, language_code:'en'}).subscribe((result) => {
        console.log('DATOS',result);
         let user=result;
        this.navCtrl.navigateForward('interior-chat', { state: { id_chat:id,nombre_chat:user.name,ultimo_mensaje:null,avatar:user.avatar } });
    }, error => {
      
      this.translate.get('notifications.No se pudo obtener los datos del usuario').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });
    }

  }


  goNotificationSettings(){
    this.navCtrl.navigateForward('notifications-settings', { state: { permissions:this.permissions } });

  }


  onIonInfinite(ev) {
    //if(!this.allowGetMore){return;}
    //this.getMoreNotifications();
   // console.log(ev);
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  goBack() {
     this.apiService.userNotCountChanges.next();
    
    if (this.routerOutlet && this.routerOutlet.canGoBack()) {
      this.routerOutlet.pop();
    } else {
      //this.utilities.showToast("uso back");
      this.navCtrl.navigateBack('/tabs/home');
    }
  }









goProject($id,$userId){






  this.apiService.obtainProject({projectId:$id,withBase64:false,language_code:'en'}).subscribe((result) => {
    console.log('Result',result);
    let theProject=result;
    console.log("THIS IS WILD");
    console.log(theProject);

    if(theProject.user_creator_id==$userId){
          console.log(`EL CREADOR`);
          this.navCtrl.navigateForward("/detail-proyect", {state: {projectSelected:$id}});
        } 
        else if (theProject.verifiedUsers.length > 0) {
          console.log('El proyecto tiene usuarios verificados:', theProject.verifiedUsers);

          const userFound = theProject.verifiedUsers.some(user => user.id === $userId);

          if (userFound) {
            console.log(`El proyecto tiene al usuario en la lista de usuarios verificados.`);
            this.navCtrl.navigateForward("/detail-proyect", {state: {projectSelected:$id}});
          } 
          else {
            console.log(`El proyecto no tiene el usuario con ese ID en la lista de usuarios verificados.`);



            this.navCtrl.navigateForward("/add-proyect", {state: {projectSelected:theProject}});
            //this.addMeToProject();
          }


        } 
        else {
          console.log('El proyecto no tiene usuarios verificados.');
          //this.addMeToProject();
          this.navCtrl.navigateForward("/add-proyect", {state: {projectSelected:theProject}});
        }
      
      
    




   
  }, error => {
   // this.utilities.showToast("No se pudo obtener las carpetas del proyecto");
    this.translate.get('notifications.No se pudo obtener las carpetas del proyecto').subscribe((translatedText: string) => {
      this.utilities.showToast(translatedText); 
    });
    console.log(error);
    //this.actu=true;
    
  });





  
        
  }

  




  ionViewWillEnter() {
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
        if (!event.url.includes('/notifications')) {
        //  console.log('Saliendo de notifications, limpiando intervalos');
          // Detener continueGettingUsers cuando se navega fuera de la página
          this.shouldContinueGettingUsers = false;
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
    // Detener continueGettingUsers cuando se sale de la página
    this.shouldContinueGettingUsers = false;
    // this.clearInterval();
  }

  ngOnDestroy() {
    // Detener continueGettingUsers cuando se destruye el componente
    this.shouldContinueGettingUsers = false;
    // this.clearInterval();
  }

  


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
      this.apiService.registerTimeScreen({screenId:37,screenTime:this.countSeg}).subscribe((result) => {
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
      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:37,screenTime:this.countSeg}).subscribe((result) => {
      }, error => {
      });
      // this.clearInterval();
      return;
    }

   

   
    if (this.isActive2) {
      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg=this.countSeg+differenceInSeconds;
     // console.log(`notifications: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
     // console.log(this.countSeg);


    } 
    else {
      //console.log('notifications: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }

  



  goUserRatings($id,$name){
    this.navCtrl.navigateForward('/user-ratings',{ state: {userValoredId:$id, userName:$name} });
  }


  
  


  formatEndDate(date: Date | string): string {
    return formatDate(date, 'dd/MM/yyyy', 'es-ES'); //
  }



  /*public async deleteNotification(notification: any) {
    
    const alert = await this.alertCtrl.create({
      header: 'Borrar Notificación',
      message: '¿Desea eliminar la notificacion actual?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            this.notifications = this.notifications.filter(n => n !== notification);
            
            this.apiService.deleteNotification({notificationId:notification.id}).subscribe((res) => {
              console.log(res);
            }, error => {
              console.log(error);
            });
          }
        }
      ]
    });

    await alert.present();

  }*/


    public async deleteNotification(notification: any) {
  const alert = await this.alertCtrl.create({
    header: this.translate.instant('Borrar Notificación'),
    message: this.translate.instant('¿Desea eliminar la notificación actual?'),
    buttons: [
      { text: this.translate.instant('Cancelar'), role: 'cancel' },
      {
        text: this.translate.instant('Aceptar'),
        handler: () => {
          // mismo manejo que onFullSwipe
          const removeFrom = (arr: any[] | null) => {
            if (!arr) return null;
            return arr.filter(n => n.id !== notification.id);
          };
          this.notifications = removeFrom(this.notifications) ?? [];
          if (this.notificationsBackup) {
            this.notificationsBackup = removeFrom(this.notificationsBackup);
          }

          this.apiService.deleteNotification({ notificationId: notification.id }).subscribe(
            res => {console.log(res),this.apiService.userNotCountChanges.next();},
            err => console.log(err)
          );
        }
      }
    ]
  });
  await alert.present();
}

  /*onFullSwipe(notification: any) {
    // Mismo comportamiento que el botón borrar
    //this.deleteNotification(notification);
    this.notifications = this.notifications.filter(n => n !== notification);
            
    this.apiService.deleteNotification({notificationId:notification.id}).subscribe((res) => {
      console.log(res);
    }, error => {
      console.log(error);
    });
  }*/


    onFullSwipe(notification: any) {
    const removeFrom = (arr: any[] | null) => {
      if (!arr) return null;
      return arr.filter(n => n.id !== notification.id);
    };

    this.notifications = removeFrom(this.notifications) ?? [];
    if (this.notificationsBackup) {
      this.notificationsBackup = removeFrom(this.notificationsBackup);
    }

    this.apiService.deleteNotification({ notificationId: notification.id }).subscribe(
      res => {console.log(res),this.apiService.userNotCountChanges.next()},

      err => console.log(err)
    );
}



  obtainPreviousPerms(){
    this.apiService.getNotificationPermissions([]).subscribe((result) => {
      console.log('PERMISOS:',result);
      if(result!=null){
        this.permissions=result; 
      /*  this.form.get('has_ratings').patchValue(result.has_ratings);
        this.form.get('has_chat_requests').patchValue(result.has_chat_requests);
        this.form.get('has_chat_requests_accepted').patchValue(result.has_chat_requests_accepted);
        this.form.get('has_project_requests').patchValue(result.has_project_requests);
        this.form.get('has_new_folders').patchValue(result.has_new_folders);
        this.form.get('has_normal_chats').patchValue(result.has_normal_chats);
        this.form.get('has_project_chats').patchValue(result.has_project_chats);
        this.form.get('has_project_end_date').patchValue(result.has_project_end_date);
        this.form.get('has_previous_project_end_date').patchValue(result.has_previous_project_end_date);
        */
      }
    }, error => {
      console.log(error);
    });
  }




  markAllRead() {
      this.allowGetMore = false;
  const setReadOne = (arr: any[] | null) =>
    arr ? arr.map(n => ({ ...n, read: 1 })) : arr;

  // Actualiza la lista visible
  this.notifications = setReadOne(this.notifications) ?? [];

  // Actualiza también el respaldo si existe
  if (this.notificationsBackup) {
    this.notificationsBackup = setReadOne(this.notificationsBackup)!;
    if (this.showOnlyUnread) {
      // Si está filtrando no leídas, ya no habrá ninguna
      this.notifications = this.notificationsBackup.filter(n => !n.read);
    }
  }


  this.apiService.markAllNotificationRead({}).subscribe(
    res => {console.log(res),  this.allowGetMore = true; this.apiService.userNotCountChanges.next();
      this.apiService.userNotCountChanges.next();
    },
    err =>{ console.log(err);  this.allowGetMore = true;}
  );
  
}



  toggleOnlyUnread(ev:any) {
    console.log('value:',ev.detail?.checked);
    this.showOnlyUnread=ev.detail?.checked;
    if(ev.detail?.checked){
      this.notificationsBackup = this.notifications;
      this.notifications = this.notificationsBackup.filter(n => !n.read);

    }
    else{
      this.notifications = this.notificationsBackup;
      this.notificationsBackup=null;
    }
    //this.showOnlyUnread = !!ev.detail?.checked;
    // Aplica el filtro como prefieras (ejemplo sencillo):
    // if (this.showOnlyUnread) {
    //   this.notifications = this.notifications.filter(n => !n.read);
    // } else {
    //   this.obtainAllUserNotifications(); // o recargar lista completa
    // }
  }

}