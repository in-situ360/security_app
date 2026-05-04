import { Component, OnInit } from '@angular/core';
import {ModalController, NavController,Platform } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';


import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-grant-permissions',
  templateUrl: './grant-permissions.page.html',
  styleUrls: ['./grant-permissions.page.scss'],
})
export class GrantPermissionsPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;

  public newProject:any=null;

  @ViewChild('mySlider') slider: IonSlides;

  public actu:any=true;
  public allowed:boolean=false;
  public participants:any=[];
  //public participantsSelected:any=[];
  public fromNewProject:boolean=false;

  public adminsSelectedIds:any=[];
  public adminsSelected:any=[];

  public form: FormGroup;

  slideOptions = {
    direction: 'horizontal',
    slidesPerView: 'auto',
  };

  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  constructor(
    private platform: Platform,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    //private camera: Camera,
    public auth: AuthenticationService,
    public navController:NavController,
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
  ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');
  }

  ngOnInit() {
    this.actu=true;
    this.newProject=history.state.newProject;

    if(history.state.fromNewProject){
      this.fromNewProject=history.state.fromNewProject;
    }

    this.form = new FormGroup({
      adminsSelectedIds: new FormControl(this.adminsSelectedIds),
      theProject: new FormControl(this.newProject.id),
      
    });
    
    this.obtainProjectParticipants();
  }

  public ionViewWillEnter(){


    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
        const currentRoute = this.router.url;
        if(currentRoute.includes('/grant-permissions')){
          console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
          //this.startInterval();
        }
      }
      else{
        //this.clearInterval();

      }
      
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Verifica si la ruta actual no es '/UserSearch'
        if (!event.url.includes('/grant-permissions')) {
        //  console.log('Saliendo de grant-permissions, limpiando intervalos');
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
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    
  }


  obtainProjectParticipants(){

    this.apiService.obtainProjectParticipants({projectId:this.newProject.id}).subscribe((result) => {
      console.log('Result',result);

      if(result['state']=='ALLOWED'){
        this.allowed=true;
      
        this.participants=result['users'];
      }
      else{

        this.abrirModalInvitado();
      }
     
      
    }, error => {
     
      this.translate.get('grant-permissions.No se obtuvieron los participantes').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
      //this.actu=true;
      
    });
  }


  getUserLabels(user): string {
    return user?.allmycategories && user.allmycategories.length > 0
        ? user.allmycategories.map(label => label).join(', ')
        : this.translate.instant('grant-permissions.Sin Categorías');
  }

  isUserSelected(participant): boolean {
    return this.adminsSelected.some(p => p.id === participant.id);
  }

  async onSlideReachEnd() {
    if(this.actu==true){
      this.actu=false;
      console.log('FIN SLIDER');
      //this.getAllCourses();
    }
    
    
  }


  selectParticipant(user) {
   
    const userExists = this.adminsSelected.find(participant => participant.id === user.id);
    
   
    if (!userExists) {
      this.adminsSelected.push(user);
      console.log('Usuario agregado:', user);
    } else {
      
      this.translate.get('grant-permissions.El usuario seleccionado ya está añadido al listado').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });

    }
  
    console.log('Lista de participantes seleccionados:', this.adminsSelected);
  }


  removeUserSelected(user) {
    // Encuentra el índice del usuario en el array participantsSelected
    const index = this.adminsSelected.findIndex(participant => participant.id === user.id);
  
    // Si el usuario fue encontrado (índice no es -1), elimínalo del array
    if (index !== -1) {
      this.adminsSelected.splice(index, 1);
      console.log('Usuario eliminado:', user);
    } else {
      console.log('Usuario no encontrado:', user);
    }
  
    console.log('Lista de participantes seleccionados después de eliminar:', this.adminsSelected);
  }



  submit(){

    // /detail-proyec

    this.adminsSelectedIds = [];
  
    // Recorrer participantsSelected y obtener las IDs
    this.adminsSelected.forEach(participant => {
      this.adminsSelectedIds.push(participant.id);
    });
  
    // Asignar las IDs al campo del formulario
    this.form.get('adminsSelectedIds').setValue(this.adminsSelectedIds);
  
    // Comprobar si hay algún valor en participantsSelectedIds
   
      // Aquí podrías proceder con la lógica para enviar el formulario
      console.log('Formulario listo para enviar', this.form.value);

      this.apiService.addPermissionsToParticipants(this.form.value).subscribe((result) => {
        console.log('DATOS',result);
        if(result['state']=="PERMISSIONS ASSOCIATED"){
         
          this.translate.get('grant-permissions.Permisos asociados').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
          this.navController.navigateRoot("/tabs/workspace");


        }
        else if(result['state']=="NOT EXIST"){
          
          this.translate.get('grant-permissions.El proyecto indicado ya no existe').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
          this.navController.navigateRoot("/tabs/workspace");


        }
        
      }, error => {
       
        this.translate.get('grant-permissions.No se puedieron asignar los permisos').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        console.log(error);
      });
    
    
    

  }

  goBack(){
    if(!this.fromNewProject){
      this.navController.pop();
    }
    // this.navCtrl.navigateBack(history.state.origen);
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
      this.apiService.registerTimeScreen({screenId:15,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`grant-permissions: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:15,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`grant-permissions: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('grant-permissions: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }

  


  async abrirModalInvitado(){


    let titleText=this.translate.instant('Sin Suscripción válida');
    let infoText=this.translate.instant('Hazte con el plan 360 para gestionar permisos a los usuarios');

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
        this.goBack();
       }

    
      });
    return await modal.present();
  }


}
