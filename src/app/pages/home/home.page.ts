import { Component, OnInit } from '@angular/core';
import {IonRouterOutlet, ModalController, NavController,Platform } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';
import { ApiService } from 'src/app/services/api.service';
import { User } from 'src/app/models/User';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { UtilitiesService } from 'src/app/services/utilities.service';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

//SEGUIMIENTO DE TIEMPO
import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  isInvited: boolean = false;
  isAndroid: boolean = false;
  isIOS: boolean = false;

  isChargeLoading:boolean=false;

  //public projects:any=[];
  public users:User[]=[];
  public advertisedUsers:any=[];

  public usersList: any = [];
  public usersListIds: any = [];
  public form: FormGroup;//el que se envia para obtener usuarios
  public formNotifications: FormGroup;

  public banner:any=null;

  @ViewChild('mySlider') slider: IonSlides;

  public actu:any=false;

  slideOptions = {
    direction: 'horizontal',
    slidesPerView: 'auto',
  };

  public notsCount:number=0;


  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  constructor(
    private navController:NavController,
    private apiService: ApiService,
    private platform: Platform,
    private modalCtrl: ModalController,
    private utilitiesService: UtilitiesService,
    private translate: TranslateService,

    private router: Router,//SEGUIMIENTO DE TIEMPO
    private routerOutlet: IonRouterOutlet
    
  ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

/*    this.isChargeLoading=true;
    setTimeout(() => {
     this.isChargeLoading=false;
    }, 3000); // 2 segundos

    setTimeout(() => {
     this.isChargeLoading=true;
    }, 6000); // 2 segundos
*/
    this.form = new FormGroup({
      usersIds:new FormControl([]), 
            
             
          });
    

  }

  ngOnInit() {
    //this.actu=true;
    if(this.apiService.getUserId()==3){
      this.isInvited=true;
      this.abrirModalInvitado();
    }

    this.apiService.userNotCountChanges.subscribe(funcion=>{
      console.log("Aplica userNotCountChanges");
      this.apiService.getNewUserNoifications({}).subscribe((result) => {
      console.log('DATOS',result);
      //this.projects=result['projects'];//concadenar listado vehiculos
      this.notsCount=result['count'];
     

    }, error => {
     // this.utilities.showToast('');
      console.log(error);
    });
     

    });


    this.apiService.getFirstsProjectsAndUsersPay({}).subscribe((result) => {
      console.log('DATOS',result);
      //this.projects=result['projects'];//concadenar listado vehiculos
      this.users=result['users'];
     

    }, error => {
     // this.utilities.showToast('');
      console.log(error);
    });


    this.actu=false;
     this.apiService.getListUsers(this.form.value).subscribe((result) => {
      console.log('Usuarios nuevos del listado: ',result);
      this.usersList = this.usersList.concat(result['users']);
      
     // this.usersListIds=this.usersListIds.concat(result['usersIds']);
      //this.form.get('usersIds').patchValue(this.usersListIds);
    
      this.actu=true;
    
    }, error => {
    
    this.actu=true;
      console.log(error);
    });

    this.apiService.getEntity('home-advertised-users').subscribe((result: any) => {
      
      console.log('anuncios:',result);
      
      this.advertisedUsers=result;

    }, error => {
      
    });
    
  }

  ionViewDidEnter() {
    console.log(this.translate.langs.length);

    if (this.platform.is('ios')) {
        this.routerOutlet.swipeGesture = true; // restaura comportamiento por defecto
      }
  
   
    this.utilitiesService.getLang().then((result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo==null) {
        console.log("No idioma");
        this.utilitiesService.saveLang('en');
  
        
      } else {
        
        this.switchLanguage(prefijo || 'en');
      }
    });


    this.obtainBanner();


    setTimeout(async () => {
      console.log("HOME CONTROL PERMISOS");
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
            
    }, 3000);
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción

    this.formNotifications = new FormGroup({
        notificationsIds: new FormControl([]),
        language_code: new FormControl(language),
      });

      console.log('>>>>>>>>>>>>>>>----',this.formNotifications.value);

        this.apiService.translateAllUserNotifications(this.formNotifications.value).subscribe((result) => {
   
  }, error => {
   
  });

    
  }


  async checkMissingPermissions(): Promise<string[]> {
    const missingPermissions: string[] = [];

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



  async onSlideReachEnd() {
    if(this.actu==true){
      this.actu=false;
      console.log('FIN SLIDER');
      //this.getMoreListUsers();
    }
    
    
  }


  getMoreListUsers(){
    /*this.apiService.getListUsers(this.form.value).subscribe((result) => {
      console.log('Usuarios nuevos del listado: ',result);
      //this.usersList = this.usersList.concat(result['users']);
      this.usersList = [...this.usersList, ...result['users']];
      this.usersListIds=this.usersListIds.concat(result['usersIds']);
      this.form.get('usersIds').patchValue(this.usersListIds);
    
      this.actu=true;

      //setTimeout(() => {
      const lastIndex = this.usersList.length - 1;
      this.slider.slideTo(lastIndex, 0); // Mueve al último slide
    //}, 1);
    
    }, error => {
      this.actu=true;
    
      console.log(error);
    });
*/

    this.slider.getActiveIndex().then(currentIndex => {

    this.apiService.getCategoryListUsers(this.form.value).subscribe((result) => {
      console.log('Usuarios nuevos del listado: ', result);

      this.usersList = [...this.usersList, ...result['users']];
      this.usersListIds = this.usersListIds.concat(result['usersIds']);
      this.form.get('usersIds').patchValue(this.usersListIds);

      this.actu = true;

      // 2. Esperar a que la vista se actualice y volver al índice anterior
   
        this.slider.slideTo(currentIndex, 0); // 0ms para evitar animación
  

    }, error => {
      this.actu = true;
      console.log(error);
    });

  });

  }

  goNotifications(){

    this.navController.navigateForward("/notifications");
  }


  goChats(){
    this.navController.navigateForward("/tabs/chats");

  }

  /*goToProject(index: number): void{

    
      const pro = this.projects[index];
      if (pro) {
        console.log('Navigating to folder:', pro);
        this.navController.navigateForward("/detail-proyect", {state: {projectSelected:this.projects[index].id}});
  
        
      } else {
        
        
        console.log('proyecto no existe para este índice:', index);
        
      }
    
  }*/

  irAPerfilPublico($userId){
    if($userId!=null && $userId!=''){
      this.navController.navigateForward("/other-user", { state: { userId: $userId } });
    }
  }


  traduccionejemplo(){
    this.apiService.ejemploTraduccion({ valor: "Hola mundo feliz" }).subscribe((result) => {
    
      console.log("RESULTADO>>>>>>>>>>>"); 
      console.log(result);
      
      
  

    


    }, error => {
      
      console.log(error);
    });
  }







  ionViewWillEnter() {
    //this.utilitiesService.showToast("SE EJECUTA ionViewWillEnter");




    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive=state.isActive;
      if(this.isActive){
    console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
    // this.startInterval();
      }
      else{
    // this.clearInterval();

      }
      
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Verifica si la ruta actual no es '/home'
        if (!event.url.includes('/home')) {
            //console.log('Saliendo de HomePage, limpiando intervalos');
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


//getFirstsProjectsAndUsersPay
    this.apiService.getNewUserNoifications({}).subscribe((result) => {
      console.log('DATOS',result);
      //this.projects=result['projects'];//concadenar listado vehiculos
      this.notsCount=result['count'];
     

    }, error => {
     // this.utilities.showToast('');
      console.log(error);
    });

  }

  
  ionViewWillLeave() {
    console.log("Se ejecuta ionViewWillLeave");
    // this.clearInterval();
  }

  
  ngOnDestroy() {
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
      this.apiService.registerTimeScreen({screenId:1,screenTime:this.countSeg}).subscribe((result) => {
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


    if(!this.isActive){

      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg=this.countSeg+differenceInSeconds;
      //console.log(`HOME: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      //console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:1,screenTime:this.countSeg}).subscribe((result) => {
        //console.log('DATOS',result);
        
      }, error => {
        
        console.log(error);
      });

    // this.clearInterval();
      return;
    }

   

   
    if (this.isActive) {
      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg=this.countSeg+differenceInSeconds;
      //console.log(`HOME: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      //console.log(this.countSeg);


    } 
    else {
      //console.log('HOME: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }

  



  public obtainBanner(){

    this.apiService.obtainBanner().subscribe((result)=>{
      console.log('banner:',result);
      this.banner=result;
      

    }, error => {
         
          console.log(error);
        });
  }

  clickBanner(url?: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
  

}
