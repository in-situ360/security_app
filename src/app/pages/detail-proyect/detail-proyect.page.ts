import { Component, OnInit } from '@angular/core';
import {IonRouterOutlet, ModalController, NavController,Platform } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { formatDate } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';


import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-detail-proyect',
  templateUrl: './detail-proyect.page.html',
  styleUrls: ['./detail-proyect.page.scss'],
})
export class DetailProyectPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;
  public theProjectId:any=null;
  public theProject:any=null;

  public countVerifiedUsers:number=0;
  public chats:any=[];

  public actu:any=true;
  private language_code:string='en';

  @ViewChild('mySlider') slider: IonSlides;
  
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

  constructor(private platform: Platform,
    private apiService: ApiService,
    private translate: TranslateService,
    private utilities: UtilitiesService,
    public auth: AuthenticationService,
    public navController:NavController,
    private modalCtrl: ModalController,
    private router: Router,//SEGUIMIENTO DE TIEMPO
    private routerOutlet: IonRouterOutlet,
  ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');
    
  }

  goBack() {
    if (this.routerOutlet && this.routerOutlet.canGoBack()) {
      this.routerOutlet.pop();
    } else {
      //this.utilities.showToast("uso back");
      this.navController.navigateBack('/tabs/workspace');
    }
  }


  ngOnInit() {
    
  }


  public ionViewWillEnter(){

    console.log("Entro en ionViewWillEnter ");

    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
        const currentRoute = this.router.url;
        if(currentRoute.includes('/detail-proyect')){
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
        if (!event.url.includes('/detail-proyect')) {
         // console.log('Saliendo de detail-proyect, limpiando intervalos');
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



    this.actu=true;

    if(history.state.projectSelected!=null){
      this.theProjectId=history.state.projectSelected;
      console.log('Project ID:',this.theProjectId);
    }


 
      console.log(this.translate.langs.length);
    
      if (this.translate.langs.length == 0) {
        console.log("No idioma");
    
        this.utilities.saveLang('en');
      }
    
    else{
      const currentLang = this.translate.currentLang;
      console.log("Idioma actual:", currentLang);
      
      this.language_code=currentLang;
    }
   
    

    this.apiService.projectDetailsChanges.subscribe(() => {
      console.log('<--------(projectDetailsChanges)---------->');
     //this.theProjectId=history.state.projectSelected;
     // this.obtainProject();
      
    });

    this.obtainProject();

  }


  obtainProject(){
    if(this.theProjectId!=null){
      this.apiService.obtainProject({projectId:this.theProjectId,withBase64:false,language_code:this.language_code}).subscribe((result) => {
        console.log('Result obtainProject:',result);
        this.theProject=result;
        if(this.theProject?.isCreator==false && this.theProject?.isProjectActive==false){
          this.utilities.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));
        }
  
        this.countVerifiedUsers=this.theProject?.verifiedUsers.length;
        this.chats=this.theProject?.chats;
        if(this.theProject?.miSub==null){
          if(this.theProject.from_project_credits!=1){
            this.abrirModalInvitado();
          }
          
        }
        
  
       // this.folders=this.folders.concat(result['folders']);//concadenar listado vehiculos
  
       // this.foldersIds=this.foldersIds.concat(result['foldersIds']);//añado nuevos ids


       
        
       
        
      }, error => {
        
        this.translate.get('detail-proyect.No se obtuvo las carpetas del proyecto').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        console.log(error);
        //this.actu=true;
        
      });

    }


  }


  async onSlideReachEnd() {
    if(this.actu==true){
      this.actu=false;
      console.log('FIN SLIDER');
      //this.getAllCourses();
    }
    
    
  }

  formatEndDate0(date: Date | string): string {
    return formatDate(date, 'dd MMMM yyyy', 'es-ES'); //
  }

  formatEndDate(date: Date | string): string {
    const langCode = this.language_code || 'en';
    return formatDate(date, 'dd MMMM yyyy', `${langCode}-${langCode.toUpperCase()}`);
  }


  irACarpetas(){
    this.navController.navigateForward("/folders", {state: {projectSelected:this.theProject}});

  }

  goToFolder(index: number): void {
    const folder = this.theProject?.folders[index];
    if (folder) {
      console.log('Navigating to folder:', folder);

      //theProject?.isCreator==true || (theProject?.isVerifiedUser==true && theProject?.isAdmin==true)" (click)="goEditPage()" id="iconRight2" src="assets/icons/ajustes-perfil.svg

      console.log("Navegando a /folder-content con argumentos:", {
        folderId: folder.id,
        projectId: this.theProject?.id,
        creator: this.theProject?.isCreator,
        isVerifiedUser: this.theProject?.isVerifiedUser,
        isAdmin: this.theProject?.isAdmin
      });
      this.navController.navigateForward("/folder-content", {state: {folderId:folder.id,projectId:this.theProject?.id, creator:this.theProject?.isCreator,isVerifiedUser:this.theProject?.isVerifiedUser,isAdmin:this.theProject?.isAdmin}});

      
    } else {
      
      
      console.log('Folder no existe para este índice:', index);
      this.navController.navigateForward("/new-folder", {state: {projectId:this.theProject.id}});
    }
  }





  goPNChat($arg1,$arg2,$arg3,$arg4,$arg5=null,$arg6){
     console.log($arg1);
     console.log($arg2);
     console.log($arg3);
     console.log($arg4);
     console.log($arg5);
     console.log($arg6);
 
     this.navController.navigateForward('interior-pnchat', { state: { id_chat:$arg1,nombre_chat:$arg2,ultimo_mensaje:$arg3,avatar:$arg4,telNumber: $arg5,userId:$arg6} });
   }



  goToProjectChats(){
    this.navController.navigateForward('pnchats', { state: { projectId:this.theProjectId} });
  }

  goEditPage(){

    console.log('Navengando a edit-project, projectId: ',this.theProjectId);
    this.navController.navigateForward('edit-project', { state: { projectId:this.theProjectId} });
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
      this.apiService.registerTimeScreen({screenId:12,screenTime:this.countSeg}).subscribe((result) => {
        //console.log('DATOS',result);
        
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
      //console.log(`detail-proyect: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      //console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:12,screenTime:this.countSeg}).subscribe((result) => {
       // console.log('DATOS',result);
        
      }, error => {
        
        console.log(error);
      });

      //this.clearInterval();
      return;
    }

   

   
    if (this.isActive2) {
      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg=this.countSeg+differenceInSeconds;
     // console.log(`detail-proyect: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
     // console.log(this.countSeg);


    } 
    else {
      console.log('detail-proyect: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }

  


  async abrirModalInvitado(){


    let titleText=this.translate.instant('detail-proyect.Sin Suscripción');
    let infoText=this.translate.instant('detail-proyect.Adquiere una suscripción para interactuar con los proyectos en los que colaboras');

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
        this.navController.pop();
       }

    
    });
    return await modal.present();
  }


  goDetailProject(){
    this.navController.navigateForward("/detail-project", {state: {projectSelectedId:this.theProjectId}});
  }

  

}
