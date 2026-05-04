import { Component, OnInit } from '@angular/core';
import {ModalController, NavController,Platform } from '@ionic/angular';
import { ModalKeycodePage } from '../modal-keycode/modal-keycode.page';

import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE

import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';


@Component({
  selector: 'app-add-proyect',
  templateUrl: './add-proyect.page.html',
  styleUrls: ['./add-proyect.page.scss'],
})
export class AddProyectPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;

  public projectSelected:any=null;

  public language_code:string='en';

  public userLabels:any='';


  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  constructor(
    private platform: Platform, 
    private modalCtrl: ModalController,
    private utilities: UtilitiesService,
    private navCtrl: NavController,
    private apiService: ApiService,
    private translate: TranslateService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
    ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');


  }

  ngOnInit() {

    this.projectSelected=history.state.projectSelected; 

  }



  public ionViewWillEnter(){

    console.log("SE EJECUTA ionViewWillEnter");
  
      App.addListener('appStateChange', (state) => {
        console.log("se lanza evento ACTIVO/INACTIVO");
        this.isActive2=state.isActive;
        if(this.isActive2){
          const currentRoute = this.router.url;
          if(currentRoute.includes('/add-proyect')){
            console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
            //this.startInterval();
          }
        }
        else{
          //this.clearInterval();

        }      });
  
      this.routerSubscription = this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          // Verifica si la ruta actual no es '/UserSearch'
          if (!event.url.includes('/add-proyect')) {
           // console.log('Saliendo de add-proyect, limpiando intervalos');
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
    }

  ionViewDidEnter() {
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

    this.obtainCreatorUserLabels();
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.language_code=language; 
  }

  goBack(){
    this.navCtrl.pop();
    // this.navCtrl.navigateBack(history.state.origen);
  }

  getUserLabels(user): string {

    console.log(user);

    return user?.allmylabels && user.allmylabels.length > 0
        ? user.allmylabels.map(label => label.value).join(', ')
        : this.translate.instant('add-proyect.Sin Categorías');
  }

  declineUserProject(){

    if(this.projectSelected!=null){
      this.apiService.declineUserProject({projectId:this.projectSelected.id}).subscribe((result) => {
        console.log('DATOS',result);
        if(result['state']=='WITHOUTSUB'){
          this.abrirModalInvitado();
          //this.translate.get('Adquiera una suscripción para poder aceptar y rechazar proyectos').subscribe((translatedText: string) => {
            //this.utilities.showToast(translatedText); 
          //});
        }
        else if(result['state']=='DECLINED'){
         
          this.translate.get('add-proyect.Proyecto rechazado con éxito').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
          this.apiService. projectsChanges.next();
          this.navCtrl.navigateRoot('/tabs/workspace');
        }
        else if(result['state']=='NOT EXIST'){
         
          this.translate.get('add-proyect.El proyecto ya no se encuentra asociado a su cuenta').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
          this.apiService. projectsChanges.next();
          this.navCtrl.navigateRoot('/tabs/workspace');
        }
  
        
  
        
      }, error => {
       
        this.translate.get('add-proyect.No se pudo rechazar el proyecto').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        console.log(error);
      });
    }
    else{
      
      this.translate.get('add-proyect.Sin proyecto').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });

    }

  }

  acceptProject(){
    

    if(this.projectSelected.keyCode!=null){

      this.abrirModal();
    }
    else{

      this.acceptWhioutKey();


    }
  }


  obtainCreatorUserLabels(){

    this.apiService.obtainCreatorUserLabels({userId:this.projectSelected.creator.id,language_code:this.language_code}).subscribe((result) => {
      console.log('DATOS',result);
      

      if (result && result.length > 0) {
        // Si hay etiquetas, las une en una cadena separada por comas
        this.userLabels = result.map(label => label.value).join(', ');
      } else {
        // Si no hay etiquetas, establece el valor según el idioma
        //if (this.language_code != 'es') {
          this.translate.get('add-proyect.Sin Categorías').subscribe((translation: string) => {
            this.userLabels = translation;
          });
       // } else {
         // this.userLabels = 'Sin Categorías';
       // }
      }
        
      

      
    }, error => {
     
      
      console.log(error);
    });
  
  

    
  }



  acceptWhioutKey(){

    this.apiService.acceptProject({projectId:this.projectSelected.id,keyCode:null}).subscribe((result) => {
      console.log('DATOS',result);
      if(result['state']=='WITHOUTSUB'){
       // this.translate.get('Adquiera una suscripción para poder aceptar y rechazar proyectos').subscribe((translatedText: string) => {
         // this.utilities.showToast(translatedText); 
        //});

        this.abrirModalInvitado();
      }
      else if(result['state']=='ACCEPTED'){
       
        this.translate.get('add-proyect.¡Proyecto aceptado!').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        this.apiService. projectsChanges.next();
        this.navCtrl.navigateRoot('/tabs/workspace');
        
      }
      else if(result['state']=='RELATION NOT EXIST'){
        
        this.translate.get('add-proyect.El proyecto ya no se encuentra asociado a su cuenta').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        this.apiService. projectsChanges.next();
        this.navCtrl.navigateRoot('/tabs/workspace');
       
      }
      else if(result['state']=='PROJECT NOT EXIST'){
        
        this.translate.get('add-proyect.El proyecto ya no existe').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        this.apiService. projectsChanges.next();
        this.navCtrl.navigateRoot('/tabs/workspace');
        
      }
      else if(result['state']=='KEYCODE INCORRECT'){
      
        this.translate.get('add-proyect.El KeyCode introducido no es correcto').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
      }

      

      
    }, error => {
      
      this.translate.get('add-proyect.No se pudo verificar el usuario en el proyecto').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });

  }



  async abrirModal(){

    if(this.projectSelected!=null){
      const modal = await this.modalCtrl.create({
        component: ModalKeycodePage,
        cssClass: 'keyCodeModal',
        componentProps: {
          projectId: this.projectSelected.id,
          
          
        },
      });
      return await modal.present();
    }
    else{
      
      this.translate.get('add-proyect.Sin proyecto').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });

    }
  }











  ionViewWillLeave() {
    console.log("Se ejecuta ionViewWillLeave");
    //this.clearInterval();
  }

  
  ngOnDestroy() {
    //this.clearInterval();
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

    if(this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
      console.log("Suscripción al router cancelada correctamente");
    }

    if (this.interval) {

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:22,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`add-proyect: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:22,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`add-proyect: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('add-proyect: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }






  async abrirModalInvitado(){


    let titleText=this.translate.instant('add-proyect.Sin Suscripción');
    let infoText=this.translate.instant('add-proyect.Adquiera una suscripción para poder aceptar y rechazar proyectos');

    const modal = await this.modalCtrl.create({
      component: InvitadoModalPage,
      cssClass: 'InvitadoMensajeModal',
      componentProps: {
       title:titleText,
       info:infoText,
       showButton:true
        
      },
     // backdropDismiss:false
    });

    modal.onDidDismiss().then((data) => {
       
      console.log(data);
      let noBack = (data.data?.noBack); 
      console.log('HAY QUE VOLVER ATRAS',noBack);
      if(!noBack){
        this.navCtrl.pop();
      }

    
    });

    return await modal.present();
  }





}
