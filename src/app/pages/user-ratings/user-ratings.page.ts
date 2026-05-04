import { Component, OnInit } from '@angular/core';
import {IonRouterOutlet, ModalController, NavController, NavParams, Platform} from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { SelectReportModalPage } from '../select-report-modal/select-report-modal.page';
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-user-ratings',
  templateUrl: './user-ratings.page.html',
  styleUrls: ['./user-ratings.page.scss'],
})
export class UserRatingsPage implements OnInit {


  language_code:string='en';

  isAndroid: boolean = false;
  isIOS: boolean = false;


  public ratings: any = [];
  public ratingsIds: any = [];

  public opcOrder: any = -1;
  public userId:any=-1;
  public userValoredId:any=-1;

  public showAddRating:boolean=false;

  selectedButton: HTMLIonButtonElement | null = null;
  public selectedOptions: string[] = []; // Guardar las opciones seleccionadas

  public name:string='';
  rating: any = 0;

  stars: Array<number> = [0, 1, 2, 3, 4];


  public hasSub:any=true;
  public userSub:number=0;
  public theSame:boolean=false;


  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------
  isChargeLoading:boolean=false;

  constructor(private translate: TranslateService,private modalCtrl: ModalController,private platform: Platform,private apiService: ApiService,private utilities: UtilitiesService,
    private navCtrl: NavController,private router: Router,//SEGUIMIENTO DE TIEMPO
    private routerOutlet: IonRouterOutlet,
    ) { 
    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');
  }

  ionViewDidEnter() {
    if (this.platform.is('ios')) {
      this.routerOutlet.swipeGesture = false; // desactiva swipe-back
    }
  }

  ionViewWillEnter() {
    //this.utilities.showLoading('');
    this.isChargeLoading=true;
    console.log("Entro en ionViewWillEnter");


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
          if (!event.url.includes('/user-ratings')) {
          //  console.log('Saliendo de user-ratings, limpiando intervalos');
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
  
  



    this.userId=history.state.userId ?? -1;
    this.userValoredId=history.state.userValoredId ?? -1;

    

    if(history.state.userName){
      this.name=history.state.userName.toUpperCase();
    }

    /*
    if(this.userId==-1 && history.state.userId!=null && this.userId!=history.state.userId){
      this.userId=history.state.userId ?? -1;
    }
    if(this.userValoredId==-1 && history.state.userValoredId!=null && this.userValoredId!=history.state.userValoredId){
      this.userValoredId=history.state.userValoredId ?? -1;
    }

    
    

    

    if(history.state.userName){
      if(this.name!='' && this.name!=history.state.userName){
        this.name=history.state.userName.toUpperCase();
      }
      
    }
    */

    

    this.obtainUserRatings();

    this.utilities.getUserId().then((result) => {
      const prefijo = result;

    if(prefijo!=this.userValoredId){
      this.showAddRating=true;
      console.log(" almacenada en storage: ",prefijo);
    }
  });

  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.language_code=language;
    
  }

  goBack() {
    this.navCtrl.pop()
  }


  ngOnInit() {
    
  }

  public obtainUserRatings() {//getSimilarCourses
    this.ratings = [];
    this.ratingsIds = [];
    this.apiService.obtainUserRatings({ userValoredId: this.userValoredId, ratingsIds: this.ratingsIds, selectedOptions:this.selectedOptions }).subscribe((result) => {
      //this.utilities.dismissLoading();
      this.isChargeLoading=false;
      console.log('Ratings DATOS', result);
      this.theSame=result['theSame'];

      if(result['miSub']!=null || this.theSame==true){

        if(result['miSub']!=null){
          this.userSub=result['miSub'];
        }
        
        
        console.log("SUSCRIPCION DEL USUARIO: ",this.userSub);
        if((this.userSub!=1 && this.userSub!=4) || this.theSame==true){
          this.ratings = this.ratings.concat(result['ratings']);
          this.ratingsIds = this.ratingsIds.concat(result['ratingsIds']);//añado nuevos ids
        }

        if((this.userSub==1 || this.userSub==4) && this.theSame!=true){
          this.abrirModalInvitado();
        }
        
      }
      else{
        this.hasSub=false;
        //this.utilities.showToast("Hazte con una suscripción para poder ver tus valoraciones y de otros usuarios");
        this.abrirModalInvitado();
      }

      

    }, error => {
      this.isChargeLoading=false;
      //this.utilities.dismissLoading();
      console.log(error);
    });
  }


  onIonInfinite(ev) {


    console.log('-----------llego al final---------------');

    this.getMore();


    console.log(ev);
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }




  getMore() {
    //this.utilities.showLoading('');
    this.isChargeLoading=true;

    console.log('>>>>>>>>>>>>getMoreFavorites>>>>>>>>>>');
    this.apiService.obtainUserRatings({ userValoredId:this.userValoredId, ratingsIds: this.ratingsIds, selectedOptions:this.selectedOptions }).subscribe((result) => {
      //this.utilities.dismissLoading();
      this.isChargeLoading=false;
      console.log('Result2', result);

      this.ratings = this.ratings.concat(result['ratings']);
      this.ratingsIds = this.ratingsIds.concat(result['ratingsIds']);//añado nuevos ids
      //this.actu=true;
    }, error => {
      //this.utilities.dismissLoading();
      this.isChargeLoading=false;
      console.log(error);
      //this.actu=true;

    });
  }

 /* toggleButton(event: Event) {
    const clickedButton = event.target as HTMLIonButtonElement;

    // If the same button is clicked, toggle its active state
    if (this.selectedButton === clickedButton) {
      clickedButton.classList.remove('active');
      this.selectedButton = null;
    } else {
      // Remove active class from previously selected button
      if (this.selectedButton) {
        this.selectedButton.classList.remove('active');
      }

      // Add active class to the clicked button
      clickedButton.classList.add('active');
      this.selectedButton = clickedButton;
    }
  }*/


    toggleButton(event: Event) {


      if(this.hasSub){

      


        const clickedButton = event.target as HTMLIonButtonElement;
        const buttonId = clickedButton.id; // Usar el ID del botón
      
        if (buttonId === 'btn1' || buttonId === 'btn2') {
          // Si se selecciona btn1 o btn2, desactiva al otro botón
          const otherButtonId = buttonId === 'btn1' ? 'btn2' : 'btn1';
          const otherButton = document.getElementById(otherButtonId);
      
          if (otherButton && otherButton.classList.contains('active')) {
            otherButton.classList.remove('active');
            this.selectedOptions = this.selectedOptions.filter(option => option !== otherButtonId);
          }
        }


        if (buttonId === 'btn3' || buttonId === 'btn4') {
          // Si se selecciona btn1 o btn2, desactiva al otro botón
          const otherButtonId = buttonId === 'btn3' ? 'btn4' : 'btn3';
          const otherButton = document.getElementById(otherButtonId);
      
          if (otherButton && otherButton.classList.contains('active')) {
            otherButton.classList.remove('active');
            this.selectedOptions = this.selectedOptions.filter(option => option !== otherButtonId);
          }
        }
      
        if (clickedButton.classList.contains('active')) {
          // Si el botón está activo, desactívalo y elimínalo del array
          clickedButton.classList.remove('active');
          this.selectedOptions = this.selectedOptions.filter(option => option !== buttonId);
        } else {
          // Si no está activo, actívalo y agrégalo al array
          clickedButton.classList.add('active');
          this.selectedOptions.push(buttonId);
        }
      
        console.log('Opciones seleccionadas (IDs):', this.selectedOptions);
          //this.utilities.showLoading('');
          this.isChargeLoading=true;
          this.ratings = [];
          this.ratingsIds= [];
          this.obtainUserRatings();

      }
    }


    addRating(){
      this.navCtrl.navigateForward('/add-rating',{ state: { userId:this.userId,userValoredId:this.userValoredId} });
    }
    
    formatEndDate0(date: Date | string): string {
      return formatDate(date, 'dd MMMM yyyy', 'es-ES'); //
    }

    formatEndDate(date: Date | string): string {
      const langCode = this.language_code || 'en';
      return formatDate(date, 'dd MMMM yyyy', `${langCode}-${langCode.toUpperCase()}`);
    }



    getStarColor(index: number, average:any): string {
      
     
      
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

    isActive(index: number, average:any): boolean {
      return index < average;
    }



    async abrirModalReporte($userId){

    
      const modal = await this.modalCtrl.create({
        component: SelectReportModalPage,
        cssClass: 'reportModal',
        componentProps: {
          userToReportId: $userId,
          
          
        },
      });
      return await modal.present();
    }

    
  
    
    ionViewWillLeave() {
      console.log("Se ejecuta ionViewWillLeave");


      if (this.platform.is('ios')) {
        this.routerOutlet.swipeGesture = true; // restaura comportamiento por defecto
      }

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
        this.apiService.registerTimeScreen({screenId:30,screenTime:this.countSeg}).subscribe((result) => {
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
        console.log(`user-ratings: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
        console.log(this.countSeg);
  
        //ENVIO TIEMPO
        this.apiService.registerTimeScreen({screenId:30,screenTime:this.countSeg}).subscribe((result) => {
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
        console.log(`user-ratings: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
        console.log(this.countSeg);
  
  
      } 
      else {
        console.log('user-ratings: No hay fecha anterior, usando la actual como inicial.');
      }
  
      
      this.previousDate = currentDate;
    }
  
    







    async abrirModalInvitado(){


      let titleText=this.translate.instant('Suscripción necesaria');
      let infoText=this.translate.instant('Hazte con una suscripción superior al Plan I para poder las valoraciones de otros usuarios');
  
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
        this.navCtrl.pop()
       }

    
      });
      return await modal.present();
    }



    goToOtherUser($userId){
      console.log('goToOtherUser');
      console.log($userId);
      this.navCtrl.navigateForward("/other-user", {state: {userId:$userId,isFromUserRatings:true}});
    }

    
  
  }
  