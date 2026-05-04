import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications-settings',
  templateUrl: './notifications-settings.page.html',
  styleUrls: ['./notifications-settings.page.scss'],
})
export class NotificationsSettingsPage implements OnInit {

  public form: FormGroup;
  isAndroid: boolean = false;
  isIOS: boolean = false;

  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  isChargeLoading:boolean=false;
  public permissions:any=null;

  constructor(public navCtrl: NavController,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private platform: Platform,
    private translate: TranslateService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
  ) { 

      this.isIOS=this.platform.is('ios');
      this.isAndroid=this.platform.is('android');

      this.permissions=history.state.permissions; 

      if(this.permissions!=null){


        this.form = new FormGroup({
        has_ratings: new FormControl(this.permissions.has_ratings),
        has_chat_requests:new FormControl(this.permissions.has_chat_requests),
        has_chat_requests_accepted:new FormControl(this.permissions.has_chat_requests_accepted),
        has_project_requests:new FormControl(this.permissions.has_project_requests),
        has_new_folders:new FormControl(this.permissions.has_new_folders),
        has_normal_chats:new FormControl(this.permissions.has_normal_chats),
        has_project_chats:new FormControl(this.permissions.has_project_chats),
        has_project_end_date:new FormControl(this.permissions.has_project_end_date),
        has_previous_project_end_date:new FormControl(this.permissions.has_previous_project_end_date),
       });


       

      }
      else{

        this.form = new FormGroup({
          has_ratings: new FormControl(false),
          has_chat_requests:new FormControl(false),
          has_chat_requests_accepted:new FormControl(false),
          has_project_requests:new FormControl(false),
          has_new_folders:new FormControl(false),
          has_normal_chats:new FormControl(true),
          has_project_chats:new FormControl(false),
          has_project_end_date:new FormControl(false),
          has_previous_project_end_date:new FormControl(false),
        });
      }
    }

  ngOnInit() {
  }

  ionViewDidEnter() {
    console.log(this.translate.langs.length);
  
    if (this.translate.langs.length == 0) {
      console.log("No idioma");
  
      this.utilities.saveLang('en');
    }

    console.log("---->");
    if(this.permissions==null){
         

    
    
      this.isChargeLoading=true;
      this.apiService.getNotificationPermissions(this.form.value).subscribe((result) => {
        console.log('DATOS',result);
        

        setTimeout(() => {
          this.isChargeLoading=false;
        }, 500);

        if(result!=null){

          this.form.get('has_ratings').patchValue(result.has_ratings);
          this.form.get('has_chat_requests').patchValue(result.has_chat_requests);
          this.form.get('has_chat_requests_accepted').patchValue(result.has_chat_requests_accepted);
          this.form.get('has_project_requests').patchValue(result.has_project_requests);
          this.form.get('has_new_folders').patchValue(result.has_new_folders);
          this.form.get('has_normal_chats').patchValue(result.has_normal_chats);
          this.form.get('has_project_chats').patchValue(result.has_project_chats);
          this.form.get('has_project_end_date').patchValue(result.has_project_end_date);
          this.form.get('has_previous_project_end_date').patchValue(result.has_previous_project_end_date);
          
        }

      }, error => {
        this.isChargeLoading=false;
        this.translate.get('notifications-settings.No se pudo obtener los datos del usuario').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        console.log(error);
      });

    }
  }

  goBack() {

    this.actualizarPermisos();
    
    
  }

  actualizarPermisos(){
    this.apiService.setNotificationPermissions(this.form.value).subscribe((result) => {
      console.log('DATOS',result);
      this.navCtrl.pop();
     

    }, error => {
      
      this.translate.get('notifications-settings.No se pudo actualizar los permisos del usuario').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      //this.utilities.showToast('No se pudieron actualizar los permisos del usuario');
      console.log(error);
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
        if (!event.url.includes('/notifications-settings')) {
          //console.log('Saliendo de notifications-settings, limpiando intervalos');
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
      this.apiService.registerTimeScreen({screenId:38,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`notifications-settings: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:38,screenTime:this.countSeg}).subscribe((result) => {
        console.log('DATOS',result);
        
      }, error => {
        
        console.log(error);
      });

      // this.clearInterval();
      return;
    }

   

   
    if (this.isActive2) {
      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg=this.countSeg+differenceInSeconds;
      console.log(`notifications-settings: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('notifications-settings: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }

  

}
