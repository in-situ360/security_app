import { Component, OnInit } from '@angular/core';
import {AlertController, ModalController, NavController,Platform } from '@ionic/angular';
import { ModalTagsPage } from '../modal-tags/modal-tags.page';
import { User } from 'src/app/models/User';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE

import { SelectModalPage } from '../select-modal/select-modal.page';
import { SelectUseroptionsModalPage } from '../select-useroptions-modal/select-useroptions-modal.page';

import { SelectReportModalPage } from '../select-report-modal/select-report-modal.page';
import { ModalMultimediaPage } from '../modal-multimedia/modal-multimedia.page';



import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

import { IonRouterOutlet } from '@ionic/angular';


@Component({
  selector: 'app-other-user',
  templateUrl: './other-user.page.html',
  styleUrls: ['./other-user.page.scss'],
})
export class OtherUserPage implements OnInit {


  isAndroid: boolean = false;
  isIOS: boolean = false;

  public user:User=null;
  public userId:any=null;
  public divOption:any=2;

  public isModalOpen2:any = false;

  option={
    slidesPerView:1.5,
    centeredSlides:true,
    loop:false,//true
    spaceBetween:10,
    //autoplay:true,
    initialSlide: 0,
  }

  stars: Array<number> = [0, 1, 2, 3, 4];
  rating: any = 0;

  public jobs:any=[];
  public jobsIds: any = [];
  //public webLinks:any=[];
  public locations:any=[];
  public actuallocation:any=null;
  public languajes:any=[];
  public userLabels:any=[];

  public userSocials:any=[];
  displayNetworks: { type_network?: number; value?: string }[] = new Array(5).fill({});

  public instagramCount:string=null;
  public twitterCount:string=null;
  public facebookCount:string=null;

  public categoriesString:string="";

  public followOPC:any="Añadir a Favoritos";
  
  public language_code:string='en';

  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  isChargeLoading:boolean=false;

  showContent:boolean=false;

  public multimediaSeleccionados: Set<number> = new Set(); // Guarda los IDs seleccionados

  public multimedias:any=[];
  public multimediaIds: any = [];

  constructor(private platform: Platform,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private apiService: ApiService,
    private translate: TranslateService,
    private utilities: UtilitiesService,
    private navCtrl: NavController,
    public auth: AuthenticationService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
    private routerOutlet: IonRouterOutlet,
  ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

    
    this.followOPC=this.translate.instant("other-user.Añadir a Favoritos");

  }


  ngOnInit() {//obtainUserJobList

    
  }

  ionViewDidEnter() {
    if (this.platform.is('ios')) {
      this.routerOutlet.swipeGesture = false; // desactiva swipe-back
    }
  }


  public ionViewWillEnter(){

    if(history.state.userId!=null && (this.userId==null|| this.userId!=history.state.userId)){
      this.userId=history.state.userId;
    }

    

    
    console.log("other user id>>>>>: ",this.userId);

    
    console.log("SE EJECUTA ionViewWillEnter");
  
      App.addListener('appStateChange', (state) => {
        console.log("se lanza evento ACTIVO/INACTIVO");
        this.isActive2=state.isActive;
        if(this.isActive2){
          const currentRoute = this.router.url;
          if(currentRoute.includes('/other-user')){
            console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
            // this.startInterval();
          }
        }
        else{
          // this.clearInterval();
  
        }
        
      });
  
      this.routerSubscription = this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          // Verifica si la ruta actual no es '/UserSearch'
          if (!event.url.includes('/other-user')) {
          //  console.log('Saliendo de other-user, limpiando intervalos');
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


      this.showContent=false;
      this.apiService.obtainOtherUser({userId: this.userId, language_code:this.language_code}).subscribe((result) => {
        this.showContent=true;
        console.log('DATOS de other user',result);
        this.user=result;
        this.userLabels=this.user.translateUserLabels;
  
        if(this.user?.hasFollow!=null){
          this.followOPC=this.translate.instant("other-user.Quitar Favorito");
  
        }
        else{
          this.followOPC=this.translate.instant("other-user.Añadir a Favoritos");
  
        }

        this.apiService.controlRequest({userId:this.userId}).subscribe((result) => {
          console.log('DATOS',result);
          if(result['state']=="DONTACCESS"){
            this.user.hasWaiting=true;
          }else{
            this.user.hasWaiting=false;
          }
        }, error => {
          console.log(error);
        });
  
        
  
  
       /* this.categoriesString="";
        this.user.allmycategories.forEach((label: any, index: number) => {
          // Agregar el valor del label a la cadena
          this.categoriesString += label;
        
          // Si no es el último elemento, añadir una coma
          if (index < this.user.allmycategories.length - 1) {
            this.categoriesString += ', ';
          }
        });*/
  
        this.categoriesString="";
        this.user.allmycategories.forEach((label: any, index: number) => {
          // Agregar el valor del label a la cadena
          
          //this.categoriesString += label;
          console.log(label);
          this.categoriesString += this.translate.instant(label);
        
          // Si no es el último elemento, añadir una coma
          if (index < this.user.allmycategories.length - 1) {
            this.categoriesString += ', ';
          }
        });
  
        
         this.obtainUserLocations();

        this.obtainUserJobList();
  
        
        
        this.obtainUserLanguajes();
  
        this.obtainUserNetworks();

        
      this.obtainPersonalArchives();
       
  
      }, error => {
        this.showContent=true;
        
        this.translate.get('other-user.No se pudo obtener los datos del usuario').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        console.log(error);
      });


    });
    

   // setTimeout(() => {
         
     //   }, 500);

    

  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.language_code=language;
  }


  showOptionPage($opc){
    console.log($opc);

    
    if($opc==2){
      //this.utilities.showLoading();
      //this.isChargeLoading=true;
      this.obtainUserLocations();
    }
    else if($opc==3){
      //this.utilities.showLoading();
      //this.isChargeLoading=true;
      this.obtainUserLanguajes();

    }
    else if($opc==4){
      //this.utilities.showLoading();
      this.isChargeLoading=true;
      this.obtainUserNetworks();

    }
    /*else if($opc==5){
      this.obtainOtherUserWebLinks();

    }*/
    this.divOption=$opc
    console.log(this.divOption);

  }

  async abrirModal(){
    const modal = await this.modalCtrl.create({
      component: ModalTagsPage,
      //cssClass: 'abrirModal',
      componentProps: {
       /* district: this.charge.mesaControl.district,*/
        
        
      },
    });
    return await modal.present();
  }

	

  goConectar($usuario){

    this.user.hasWaiting=true;

    this.apiService.controlRequest({userId:this.user.id}).subscribe((result) => {
      console.log('DATOS',result);
      if(result['state']=="ACCESS"){
        this.navCtrl.navigateForward("/conectar", {state: {user:$usuario}});
        
      }
      else if(result['state']=="DONTACCESS"){
        
        this.translate.get('other-user.Ya hay una solicitud enviada pendiente de aceptar').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
      }
      else if(result['state']=="GOCHAT"){
        console.log('debe ir al chat');
        

      }
      else{
        
        this.translate.get('other-user.Resultado desconocido').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
      }
      
    

    }, error => {
     
      this.translate.get('other-user.No se pudo comprobar la existencia de la solicitud').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });

    

  }


  goChat(){
   
    this.navCtrl.navigateForward('interior-chat', { state: { id_chat:this.user.hasChat.id,
      nombre_chat:this.user.name,
      ultimo_mensaje:null,
      avatar:this.user.avatar,
      telNumber: null,
      userId:this.user.id
    } });

  }



  follow(){
    if(this.user?.hasFollow!=null){
      console.log("QUITAR");
      this.apiService.followUnfollow({userId:this.user.id,opc:1}).subscribe((result) => {
        console.log('DATOS',result);
        this.followOPC=this.translate.instant("other-user.Añadir a Favoritos");
        this.user.hasFollow = null;
        this.apiService.changeHasFollowInUser(this.user.id,null);
        
    }, error => {
        this.utilities.showToast('');
        console.log(error);
    });

    }
    else{

      console.log("GUARDAR");
      this.apiService.followUnfollow({userId:this.user.id,opc:2}).subscribe((result) => {
        console.log('DATOS',result);
        this.followOPC=this.translate.instant("other-user.Quitar Favorito");
        this.user.hasFollow =result;
        this.apiService.changeHasFollowInUser(this.user.id,result);
        //this.apiService.notificarNuevosMensajes(result);
    }, error => {
        this.utilities.showToast('');
        console.log(error);
    });

    }
      


  }

  goBack(){

    this.navCtrl.pop();

   /* if(history.state.isFromUserRatings!=null){
      this.navCtrl.navigateBack('user-ratings');
    }
    else{*/
     // this.navCtrl.pop();
   // }

    


  }




  public obtainUserJobList(){
    this.jobs =[];
    this.jobsIds = [];
    this.apiService.obtainOtherUserJobList({jobsIds:this.jobsIds,userId:this.userId}).subscribe((result) => {
      console.log('DATOS',result);
      this.jobs=this.jobs.concat(result['jobs']);
      this.isChargeLoading=false;
      //this.utilities.dismissLoading();
      //------------
      // Filtrar las imágenes de multimedia
      /*this.jobs.forEach(vehicle => {
        if (vehicle.multimedia) {
          vehicle.multimedia = vehicle.multimedia.filter(media => media.thetype === 'imagen');
        }
      });*/
      //------------

      this.jobsIds=this.jobsIds.concat(result['jobsIds']);//añado nuevos ids
      

    }, error => {
      this.isChargeLoading=false;
      //this.utilities.dismissLoading();
      this.translate.get('other-user.No se pudieron obtener los trabajos').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });
  }


  onIonInfiniteJobs(ev) {

    
    console.log('-----------llego al final---------------');
    
     this.getMorePersonalArchives();
    
    
    console.log(ev);
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }


  getMoreJobs() {
    
    console.log('>>>>>>>>>>>>getMoreFavorites>>>>>>>>>>');
     this.apiService.obtainOtherUserJobList({jobsIds:this.jobsIds,userId:this.userId}).subscribe((result) => {
       console.log('Result2',result);
       
       this.jobs=this.jobs.concat(result['jobs']);//concadenar listado vehiculos
       
       //------------
       // Filtrar las imágenes de multimedia
       /*this.jobs.forEach(vehicle => {
         if (vehicle.multimedia) {
           vehicle.multimedia = vehicle.multimedia.filter(media => media.thetype === 'imagen');
         }
       });*/
       //------------
 
       this.jobsIds=this.jobsIds.concat(result['jobsIds']);//añado nuevos ids
       
 
       
       //this.actu=true;
     }, error => {
      this.translate.get('other-user.No se pudieron obtener los trabajos').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
       console.log(error);
       //this.actu=true;
       
     });
   }


  /* public obtainOtherUserWebLinks(){
    this.webLinks =[];
    
    this.apiService.obtainOtherUserWebLinks({userId:this.userId,language_code: this.language_code }).subscribe((result) => {
      console.log('DATOS',result);
      this.webLinks=result['userWebLinks'];

    }, error => {
      //this.utilities.showToast('No se pudieron obtener las ubicaciones');
      this.translate.get('my-profile.No se pudieron obtener las ubicaciones').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });
  }*/

  redirectToWeb(url: string) {
    // Verifica si la URL es válida y luego redirige al navegador
    if (url) {
      window.location.href = url;
    }
  }


   public obtainUserLocations(){
    this.locations =[];
    
    
    this.apiService.obtainOtherUserLocations({userId:this.userId,language_code:this.language_code}).subscribe((result) => {
      console.log('DATOS',result);


      
      
      //this.locations=result;
      //this.locations=result['othersLocs'];
      this.locations=this.locations.concat(result['othersLocs']);
      this.actuallocation=result['actualLoc'];
      this.isChargeLoading=false;
      //this.utilities.dismissLoading();

    }, error => {
      this.isChargeLoading=false;
      //this.utilities.dismissLoading();
      this.translate.get('other-user.No se pudieron obtener las ubicaciones').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });
  }


  public obtainUserLanguajes(){
    this.languajes =[];
    
    this.apiService.obtainOtherUserLanguajes({userId:this.userId,language_code:this.language_code}).subscribe((result) => {
      console.log('DATOS',result);
      this.languajes=result;
      this.isChargeLoading=false;
      //this.utilities.dismissLoading();

    }, error => {
      this.isChargeLoading=false;
      //this.utilities.dismissLoading();
      this.translate.get('other-user.No se pudieron obtener los idiomas').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });
  }


  public obtainUserNetworks(){
    
    this.apiService.obtainOtherUserNetworks({userId:this.userId}).subscribe((result) => {
      console.log('DATOS',result);
      this.userSocials=result['userSocials'];
      this.isChargeLoading=false;
      //this.utilities.dismissLoading();

      // Fill in the displayNetworks array with existing userSocials data
      for (let i = 0; i < this.userSocials.length; i++) {
        this.displayNetworks[i] = this.userSocials[i];
      }


      this.instagramCount=result['instagramValue'];
      this.twitterCount=result['twitterValue'];
      this.facebookCount=result['facebookValue'];
      //result['jobs'];
      
    }, error => {
      this.isChargeLoading=false;
     // this.utilities.dismissLoading();
      this.translate.get('other-user.No se pudieron obtener las redes').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });
  }







  async abrirModalOpcionesUsuario(){
    const modal = await this.modalCtrl.create({
      component: SelectUseroptionsModalPage,
      cssClass: 'SelectModal',
      componentProps: {
       /* district: this.charge.mesaControl.district,*/
        
        
      },
     // backdropDismiss:false
    });

    modal.onDidDismiss().then((data) => {
     // const selectedNetwork = data.data?.selectedNetwork;
     const selectedOption = Number(data.data.selectedNetwork); 
     console.log('Opcion de usuario devuelta:', selectedOption);
      
      if(selectedOption==1){//BLOQUEAR USUARIO
        this.bloquear();
      


      }
      else if(selectedOption==2){//REPORTAR USUARIO
        this.abrirModalReporte();

      }
      else{

        console.log("cancelada");
      }

    
    



    });


    return await modal.present();
  }




  public async bloquear() {

    let valtext=this.translate.instant('other-user.¿Desea bloquear a este usuario?');
    const alert = await this.alertCtrl.create({
      header: '',
      message: valtext,
      buttons: [
        {
          text: this.translate.instant('other-user.cancelar'),
          role: 'cancel'
        },
        {
          text: this.translate.instant('other-user.bloquear'),
          handler: () => {
            this.apiService.blockUser({ userToBlockeId:this.userId }).subscribe((result) => {
      
              console.log("RESULTADO>>>>>>>>>>>"); 
              console.log(result);
              if(result['state']=="USERBLOCKED"){
                this.translate.get('other-user.Usuario bloqueado').subscribe((translatedText: string) => {
                  this.utilities.showToast(translatedText); 
                });
              }
              else if(result['state']=="COINCIDENCE"){
                this.translate.get('other-user.El usuario ya se encuentra bloqueado').subscribe((translatedText: string) => {
                  this.utilities.showToast(translatedText); 
                });
    
              }
              else{
                this.translate.get('other-user.Respuesta desconocida').subscribe((translatedText: string) => {
                  this.utilities.showToast(translatedText); 
                });
              }
    
             }, error => {
              console.log(error);
          });
           
            
          }
        }
      ]
    });

    await alert.present();

  }


  async abrirModalReporte(){

    
      const modal = await this.modalCtrl.create({
        component: SelectReportModalPage,
        cssClass: 'reportModal',
        componentProps: {
          userToReportId: this.userId,
          
          
        },
      });
      return await modal.present();
    }




    /*async abrirModalMultimedia($media){

      console.log($media);
  
      const modal = await this.modalCtrl.create({
        component: ModalMultimediaPage,
        cssClass: 'MultimediaModal',
        componentProps: {
          mediaArchive: $media,
          mediaType:'imagen',
          id:-1,
          fromProfile:true,
        },
       // backdropDismiss:false
      });
      return await modal.present();
    }*/

    async abrirModalMultimedia1($media,$type,$id){

    //if(this.seleccionando!=true){

      const modal = await this.modalCtrl.create({
        component: ModalMultimediaPage,
        cssClass: 'MultimediaModal',
        componentProps: {
          mediaArchive: $media,
          mediaType:$type,
          id:$id,
          pdfName:'',
          fromProfile:true,
        },
      // backdropDismiss:false
      });
      return await modal.present();
    //}
  }

  


  


  async abrirModalMultimedia($media,$type,$id,$multimedia){

    //if(this.seleccionando!=true){

      let name=this.extractOriginalName($multimedia);

      const modal = await this.modalCtrl.create({
        component: ModalMultimediaPage,
        cssClass: 'MultimediaModal',
        componentProps: {
          mediaArchive: $media,
          mediaType:$type,
          id:$id,
          pdfName:name,
          fromProfile:true,
        },
      // backdropDismiss:false
      });
      return await modal.present();
    //}
  }


  extractOriginalName(multimedia: any): string | null {
  try {
    // Si existe la variable pdf_name_translate, devolver su valor
    if (multimedia.pdf_name_translate) {
      return multimedia.pdf_name_translate;
    }

    // Parsear el JSON del campo 'archive'
    const parsedData = JSON.parse(multimedia.archive);

    // Verificar que sea un array y tenga al menos un elemento con 'original_name'
    if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].original_name) {
      return parsedData[0].original_name; // Retorna el original_name del primer objeto
    }

    return null; // Si no se encuentra original_name o el array está vacío
  } catch (error) {
    console.error("Error al parsear el JSON:", error);
    return null; // Si ocurre un error en el parseo
  }
}


    goUserRatings($id,$name){
      this.navCtrl.navigateForward('/user-ratings',{ state: {userValoredId:$id, userName:$name} });
    }

   
    getStarColor(index: number): string {

      if (this.user.averageRating === 0 || this.user.averageRating === null || this.user.averageRating === undefined) {
        // Si no hay valoración, las tres primeras estrellas son activas
        return index < 3 ? 'assets/icons/estrella-valoracion.svg' : 'assets/icons/estrella-gris.svg';
      }

      const fractional = this.user.averageRating - index;
  
      if (fractional >= 1) {
        // Star is fully filled
        //console.log("ENTRA ACTIVA");
        return 'assets/icons/estrella-valoracion.svg'; // Pink star
      } else if (fractional > 0) {
        // Star is partially filled
        return 'assets/icons/estrella-half.svg'; // You'd need an SVG for half stars
      } else {
        // Star is empty
        return 'assets/icons/estrella-gris.svg'; // Gray star
      }
    }

    isActive(index: number): boolean {
      return index < this.user.averageRating;
    }
  
    updateStars() {
      // Trigger re-render of stars on rating change
      console.log(`Current rating: ${this.rating}`);
    }

    
  
    
    ionViewWillLeave() {
      console.log("Se ejecuta ionViewWillLeave");
      // this.clearInterval();


      if (this.platform.is('ios')) {
        this.routerOutlet.swipeGesture = true; // restaura comportamiento por defecto
      }


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

      if(this.routerSubscription) {
        this.routerSubscription.unsubscribe();
        this.routerSubscription = null;
        console.log("Suscripción al router cancelada correctamente");
      }

      if (this.interval) {
  
        //ENVIO TIEMPO
        this.apiService.registerTimeScreen({screenId:6,screenTime:this.countSeg}).subscribe((result) => {
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
        //console.log(`other-user: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
        //console.log(this.countSeg);
  
        //ENVIO TIEMPO
        this.apiService.registerTimeScreen({screenId:6,screenTime:this.countSeg}).subscribe((result) => {
        //  console.log('DATOS',result);
          
        }, error => {
          
          console.log(error);
        });
  
        // this.clearInterval();
        return;
      }
  
     
  
     
      if (this.isActive2) {
        const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
        this.countSeg=this.countSeg+differenceInSeconds;
       // console.log(`other-user: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
       // console.log(this.countSeg);
  
  
      } 
      else {
       // console.log('other-user: No hay fecha anterior, usando la actual como inicial.');
      }
  
      
      this.previousDate = currentDate;
    }
  
    goUserTags(){

      this.navCtrl.navigateForward("/usersetags", {state: {userId:this.userId}});

    }
  

    redirectToSocial(url: string) {
      // Verifica si la URL es válida y luego redirige al navegador
      if (url) {
        window.location.href = url;
      }
    }



    async abrirModalCarrusel(index: number) {
      console.log("abrir modal grnade");
      this.isModalOpen2 = true;
      this.option.initialSlide = index;
      
    }



    cerrar($modal){
    
      //$modal.dismiss();
      console.log('funcion cerrar');
      this.isModalOpen2 = false;
    }
  
  
    onSlideEnd() {
      console.log('You have reached the end of the carousel!');
      this.getMorePersonalArchives();
    }


    getMorePersonalArchives() {
    this.apiService.obtainPersonalArchivesOtherUser({userId:this.userId,multimediasIds:this.multimediaIds,language_code:this.language_code}).subscribe((result) => {
      console.log('Result2',result);
      this.multimedias=this.multimedias.concat(result['multimedias']);//concadenar listado 
      this.multimediaIds=this.multimediaIds.concat(result['multimediaIds']);//añado nuevos ids
    }, async error => {    
      const toastMensaje = await this.translate.get("my-jobs.No se pudo obtener los trabajos").toPromise();
      this.utilities.showToast(toastMensaje); 
      console.log(error);      
    });
  }

  obtainPersonalArchives(){
    //obtainFolderData
    this.multimedias=[];
    this.multimediaIds = [];
    this.apiService.obtainPersonalArchivesOtherUser({userId:this.userId,multimediasIds:this.multimediaIds,language_code:this.language_code}).subscribe((result) => {
      console.log('Result',result);
      this.multimedias=this.multimedias.concat(result['multimedias']);//concadenar listado 
      this.multimediaIds=this.multimediaIds.concat(result['multimediaIds']);//añado nuevos ids
    }, error => {
      console.log(error);
    });
  }



  async abrirModalMedia(multimedia:any){

    if(multimedia.thetype === 'imagen'){
      this.abrirModalMultimedia1(multimedia.thevalue, multimedia.thetype, multimedia.id);
    }
    else if(multimedia.thetype === 'PDF'){
      this.abrirModalMultimedia(multimedia.thevalue, multimedia.thetype, multimedia.id,multimedia);
    }
    else if(multimedia.thetype==='video'){
      this.abrirModalMultimedia1(multimedia.thevalue, multimedia.thetype, multimedia.id);
    }
     /*<video *ngIf="multimedia.thetype==='video'" id="videoTrailer" width="100%" height="100%" controls controlsList="nodownload">
                <source [src]="multimedia?.thevalue">Your browser does not support the video tag.
              </video>*/
  }




  // Función para obtener el nombre del archivo desde la URL
  getFileName(url: string): string {
    if (!url) return '';
    const fileName = url.split('/').pop()?.split('?')[0] || '';
    const name = fileName.replace(/\.pdf$/i, '');
    // Acortar el nombre si es muy largo
    const maxLen = 20;
    return decodeURIComponent(name.length > maxLen ? name.slice(0, maxLen) + '...' : name);
  }


  }
  
