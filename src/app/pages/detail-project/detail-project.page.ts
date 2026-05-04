import { Component, OnInit } from '@angular/core';
import {ModalController, NavController,Platform } from '@ionic/angular';
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
  selector: 'app-detail-project',
  templateUrl: './detail-project.page.html',
  styleUrls: ['./detail-project.page.scss'],
})
export class DetailProjectPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;
  public theProjectId:any=null;
  public theProject:any=null;
  public translateCreator:any=null;

  public countVerifiedUsers:number=0;
  public chats:any=[];

  public actu:any=true;
  private language_code:string='en';

  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  rating: any = 0;
  stars: Array<number> = [0, 1, 2, 3, 4];

  constructor(private platform: Platform,
    private apiService: ApiService,
    private translate: TranslateService,
    private utilities: UtilitiesService,
    public auth: AuthenticationService,
    public navController:NavController,
    private modalCtrl: ModalController,
    private router: Router,//SEGUIMIENTO DE TIEMPO
  ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');
    
  }

  goBack() {
    //ANTESS this.navCtrl.pop()
    this.navController.pop();
  }

  ngOnInit() {
  }

  public ionViewWillEnter(){
    this.actu=true;

    if(history.state.projectSelectedId!=null){
      this.theProjectId=history.state.projectSelectedId;
      console.log(this.theProjectId);
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
        console.log('Result details',result);
        this.theProject=result;
        
        if(this.theProject.translateUserCreator!=null){
          this.theProject.creator=this.theProject.translateUserCreator;
        }
        console.log(this.theProject);
  
        this.countVerifiedUsers=this.theProject?.verifiedUsers.length;
        this.chats=this.theProject?.chats;
        if(this.theProject?.miSub==null && this.theProject?.from_project_credits!=1){
          this.abrirModalInvitado();
        }
        if(this.theProject?.isCreator==false && this.theProject?.isProjectActive!=true){
          this.utilities.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));
        }
        
  
       
        
      }, error => {
        
        this.translate.get('detail-proyect.No se obtuvo las carpetas del proyecto').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        console.log(error);
        //this.actu=true;
        
      });

    }


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


  formatEndDate0(date: Date | string): string {
    return formatDate(date, 'dd MMMM yyyy', 'es-ES'); //
  }

  formatEndDate(date: Date | string): string {
    const langCode = this.language_code || 'en';
    return formatDate(date, 'dd MMMM yyyy', `${langCode}-${langCode.toUpperCase()}`);
  }


  getStarColor(index: number, average:any): string {

    if (average === 0 || average === null || average === undefined) {
      // Si no hay valoración, las tres primeras estrellas son activas
      return index < 3 ? 'assets/icons/estrella-valoracion.svg' : 'assets/icons/estrella-gris.svg';
    }

    const fractional = average - index;

    if (fractional >= 1) {
      // Star is fully filled
      console.log("ENTRA ACTIVA");
      return 'assets/icons/estrella-valoracion.svg'; // Pink star
    } else if (fractional > 0) {
      // Star is partially filled
      return 'assets/icons/estrella-half.svg'; // You'd need an SVG for half stars
    } else {
      // Star is empty
      return 'assets/icons/estrella-gris.svg'; // Gray star
    }
  }

  getUserLabels(user): string {
    // Primero verifica si existe translateUserLabels y contiene elementos
    return user?.translateUserLabels && user.translateUserLabels.length > 0
      ? user.translateUserLabels.map(label => label.value).join(', ')
      : user?.allmylabels && user.allmylabels.length > 0
        ? user.allmylabels.map(label => label.value).join(', ')
        : this.translate.instant('buscador2.Sin tags'); // Traduce 'Sin tags' si no hay etiquetas
  }


  goParticipantsPages(){

        this.navController.navigateForward("/edit-participants", {state: {projectId:this.theProjectId, creator:this.theProject.creator,fromDetailProject:true}});




  }


  selectUser($userId){
    console.log($userId);
    this.navController.navigateForward("/other-user", { state: { userId: $userId } });

  }


  goEditParticipantsList(){

   

    if(this.theProject?.isCreator==true || (this.theProject?.isVerifiedUser==true && this.theProject?.isAdmin==true)){
       console.log('Redireccionando a participants-list, pansando:',{projectId:this.theProjectId,modifyAllowed:true, creator:this.theProject.creator,fromDetailProject:true});
      this.navController.navigateForward("/participants-list", {state: {projectId:this.theProjectId,modifyAllowed:true,creator:this.theProject.creator,fromDetailProject:true}});

    }
    else{
       console.log('Redireccionando a participants-list, pansando:',{projectId:this.theProjectId,modifyAllowed:false,creator:this.theProject.creator,fromDetailProject:true});
      this.navController.navigateForward("/participants-list", {state: {projectId:this.theProjectId,modifyAllowed:false,creator:this.theProject.creator,fromDetailProject:true}});

    }
    
  }


}
