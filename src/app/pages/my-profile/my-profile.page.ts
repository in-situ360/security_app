import { Component, OnInit } from '@angular/core';
import {ModalController, NavController,Platform } from '@ionic/angular';
import { ModalTagsPage } from '../modal-tags/modal-tags.page';
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';

import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE

import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { User } from 'src/app/models/User';
import { AuthenticationService } from 'src/app/services/authentication.service';

import { ModalMultimediaPage } from '../modal-multimedia/modal-multimedia.page';




import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss'],
})
export class MyProfilePage implements OnInit {


  option={
    slidesPerView:1.5,
    centeredSlides:true,
    loop:false,//true
    spaceBetween:10,
    //autoplay:true,
    initialSlide: 0,
  }
  countTask:number=0;

  isAndroid: boolean = false;
  isIOS: boolean = false;
  isInvited: boolean = false;

  public user:User=null;

  public divOption:any=2;


  public jobs:any=[];
  public jobsIds: any = [];

  public locations:any=[];
  //public webLinks:any=[];
  public actuallocation:any=null;
  public languajes:any=[];
  public userLabels:any=[];
  public userLabelsToShow:any=[];

  public userSocials:any=[];

  public language_code:string='en';

  displayNetworks: { type_network?: number; value?: string }[] = new Array(5).fill({});

  public instagramCount:string=null;
  public twitterCount:string=null;
  public facebookCount:string=null;

  public categoriesString:string="";

  stars: Array<number> = [0, 1, 2, 3, 4];
  rating: any = 0;



  public multimedias:any=[];
  public multimediaIds: any = [];


  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  public isModalOpen2:any = false;

  public multimediaSeleccionados: Set<number> = new Set(); // Guarda los IDs seleccionados
  public deleteJobChangeSubscription: Subscription | null = null;


  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private navCtrl: NavController,
    public auth: AuthenticationService,
    private translate: TranslateService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
  ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

  }


  ngOnInit() {
    console.log("cargo el ngOnInit del PERFIL");
    
    this.apiService.userChanges2.next();
    this.apiService.userChanges2.subscribe(funcion=>{
      console.log("musica");
      this.inicializarPagina();

    });

    this.apiService.laguageChanges.subscribe(funcion=>{
      console.log("laguageChanges----");
      this.utilities.getLang().then((result) => {
        const prefijo = result;
        console.log(prefijo); // Esto debería mostrar "en"
        if (prefijo==null) {
          console.log("No idioma");
          this.utilities.saveLang('en');
    
          
        } else {
          
          this.switchLanguage(prefijo || 'en');
        }
        this.obtainUserLanguajes();
      });
      
    });

    this.apiService.personalArchiveChanges.subscribe((pa) => {
    const index = this.multimedias.findIndex(item => item.id === pa.id);
    if (index !== -1) {
      this.multimedias[index] = pa;
      console.log('Archivo personal actualizado en el array multimedias:', pa);
    }
  });

  this.apiService.personalArchiveNew.subscribe((pa) => {
    this.multimediaIds.push(pa?.id);
    this.multimedias.unshift(pa);
  });

  if(!this.deleteJobChangeSubscription){
    this.deleteJobChangeSubscription=this.apiService.deleteJobChange.subscribe((id) => {
      //const index = this.multimedias.findIndex(item => item.id === id);
      this.multimedias = this.multimedias.filter(multimedia => multimedia.id !== id);
        
      
    });
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
      this.inicializarPagina();
    });

    
    
  }


  async abrirModalCarrusel(index: number) {
    console.log("abrir modal grnade");
    this.isModalOpen2 = true;
    this.option.initialSlide = index;
    
  }

  async abrirModalInvitado(){


    let titleText=this.translate.instant('my-profile.Sin Suscripción');
    let infoText=this.translate.instant('my-profile.Hazte con una suscripción para utilizar la aplicación al completo y sacarle mejor partido');

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
    
    return await modal.present();
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.language_code=language;
    
  }


  resetar(){
    this.apiService.userChanges2.next();
  }

  inicializarPagina(){
    console.log('METO VALORES>>>>>>><');

    this.apiService.getEntity('user').subscribe((user: User) => {
      this.user = user;
     // this.userLabels=this.user.mylabels;
      console.log(this.user);
      console.log(this.user?.sub_id);
      console.log(">>>>>")
      this.obtainUserLabels();
      this.obtainUserLocations();

      

      this.countTask=0;
      if(this.user.completedTask['jobTask'] && this.user.completedTask['jobTask']=="COMPLETED"){

        this.countTask=this.countTask+1;
      }

      if(this.user.completedTask['lanTask'] && this.user.completedTask['lanTask']=="COMPLETED"){

        this.countTask=this.countTask+1;
      }

      if(this.user.completedTask['locTask'] && this.user.completedTask['locTask']=="COMPLETED"){

        this.countTask=this.countTask+1;
      }

      if(this.user.completedTask['snTask'] && this.user.completedTask['snTask']=="COMPLETED"){

        this.countTask=this.countTask+1;
      }

      if(this.user.completedTask['personalDataTask'] && this.user.completedTask['personalDataTask']=="COMPLETED"){

        this.countTask=this.countTask+1;
      }

      //this.apiService.userChanges.next();

      this.categoriesString="";
      this.user.allmycategories.forEach((label: any, index: number) => {
        // Agregar el valor del label a la cadena
        
        //this.categoriesString += label;
        this.categoriesString += this.translate.instant(label);
      
        // Si no es el último elemento, añadir una coma
        if (index < this.user.allmycategories.length - 1) {
          this.categoriesString += ', ';
        }
      });


      //this.form.patchValue(user);
      //this.isLoading = false;
    }, error => {
      //this.utilities.showToast("Error obteniendo el usuario");


      this.translate.get('my-profile.Error obteniendo el usuario').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });



      //this.isLoading = false;
    });

    this.obtainUserJobList();
    this.obtainPersonalArchives();
    
  console.log(">>>>>")
    // Comentamos esta llamada duplicada que se ejecuta antes de obtener el usuario
    // this.obtainUserLabels();
  
     
    // Comentamos esta llamada duplicada que se ejecuta antes de obtener el usuario  
    // this.obtainUserLocations();
      
      
    this.obtainUserLanguajes();
  
      
      
    this.obtainUserNetworks();
  
      
  }



  showOptionPage($opc){
    console.log($opc);

    if($opc==2){
      this.obtainUserLocations();
    }
    else if($opc==3){
      this.obtainUserLanguajes();

    }
    else if($opc==4){
      this.obtainUserNetworks();

    }
    /*else if($opc==5){
      this.obtainUserWebLinks();

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







  public obtainUserJobList(){
    this.jobs =[];
    this.jobsIds = [];
    this.apiService.obtainUserJobList({jobsIds:this.jobsIds}).subscribe((result) => {
      console.log('DATOS',result);
      this.jobs=this.jobs.concat(result['jobs']);
      
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
     // this.utilities.showToast('No se pudieron obtener los trabajos');
      this.translate.get('my-profile.No se pudieron obtener los trabajos').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });
  }


  onIonInfiniteJobs(ev) {

    
    console.log('-----------llego al final---------------');
    
     //this.getMoreJobs();
     this.getMorePersonalArchives();
    
    
    console.log(ev);
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }




  getMoreJobs() {
    
   console.log('>>>>>>>>>>>>getMoreFavorites>>>>>>>>>>');
    this.apiService.obtainUserJobList({jobsIds:this.jobsIds}).subscribe((result) => {
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
      //this.utilities.showToast("No se pudieron obtener los trabajos");
      this.translate.get('my-profile.No se pudieron obtener los trabajos').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
      //this.actu=true;
      
    });
  }



  public obtainUserLocations(){
    this.locations =[];
    
    this.apiService.obtainUserLocations({language_code: this.language_code }).subscribe((result) => {
      console.log('DATOS',result);
      this.locations=result['locations'];
      this.actuallocation=result['actual'];

    }, error => {
      //this.utilities.showToast('No se pudieron obtener las ubicaciones');
      this.translate.get('my-profile.No se pudieron obtener las ubicaciones').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });
  }

  /*public obtainUserWebLinks(){
    this.webLinks =[];
    
    this.apiService.obtainUserWebLinks({language_code: this.language_code }).subscribe((result) => {
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


  public obtainUserLanguajes(){
    this.languajes =[];
    
    this.apiService.obtainUserLanguajes({language_code:this.language_code}).subscribe((result) => {
      console.log('DATOS',result);
      this.languajes=result;
   

    }, error => {
      //this.utilities.showToast('No se pudieron obtener los idiomas');
      this.translate.get('my-profile.No se pudieron obtener los idiomas').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });
  }


  public obtainUserLabels(){

    //this.userLabels =[];
    //this.userLabelsToShow =[];
    
    // Validar que el usuario existe y tiene id antes de hacer la llamada
    if (!this.user || !this.user.id) {
      console.warn('Usuario no disponible para obtener etiquetas');
      return;
    }
    
    this.apiService.obtainUserLabels({language_code:this.language_code,userId:this.user.id}).subscribe((result) => {
      console.log('DATOStags',result);
      this.userLabels=result;
      this.userLabelsToShow = result.slice(0, 4);
   

    }, error => {
     // this.utilities.showToast('No se pudieron obtener las etiquetas');
      this.translate.get('my-profile.No se pudieron obtener las etiquetas').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });

  }



  public obtainUserNetworks(){
    
    this.apiService.obtainUserNetworks({}).subscribe((result) => {
      console.log('DATOS',result);
      this.userSocials=result['userSocials'];

      // Fill in the displayNetworks array with existing userSocials data
      for (let i = 0; i < this.userSocials.length; i++) {
        this.displayNetworks[i] = this.userSocials[i];
      }


      this.instagramCount=result['instagramValue'];
      this.twitterCount=result['twitterValue'];
      this.facebookCount=result['facebookValue'];
      //result['jobs'];
      
    }, error => {
      //this.utilities.showToast('No se pudieron obtener las redes');
      this.translate.get('my-profile.No se pudieron obtener las redes').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });
  }

  


  goToFinishPage(){
    //if(this.isInvited){
      //this.abrirModalInvitado();
    //}
   // else{
      this.navCtrl.navigateForward('/finish-profile');
    //}
    

  }

  goToLocations(){
    if(this.user?.sub_id==null){
      this.abrirModalInvitado();
    }
    else{
      this.navCtrl.navigateForward('/locations');
    }
  }

  goToLanguajes(){
    if(this.user?.sub_id==null){
      this.abrirModalInvitado();
    }
    else{
      this.navCtrl.navigateForward('/languages');
    }
  }


  goToSocial(){
    console.log(this.user?.sub_id);

    if(this.user?.sub_id==null){
      this.abrirModalInvitado();
    }
    else{
      this.navCtrl.navigateForward('/social-networks');
    }
    
  }

  goToJobs(){


    

    if(this.user?.sub_id==null){
      this.abrirModalInvitado();
    }
    else{
      this.navCtrl.navigateForward('/my-jobs');
    }
    
  }

  goToSettings(){

    //if(this.isInvited){
      //this.auth.logout();
    //}
    //else{
      this.navCtrl.navigateForward('/settings');
    //}
    
  }

  cerrarSesion() {

    this.auth.logout();

    /*this.apiService.userOfline().subscribe((user) => {
      console.log(user);
      this.auth.logout();
    }, error => {

      console.log(error);
    });*/


  }



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


  showRatings(){
    this.navCtrl.navigateForward('/user-ratings');
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

  isActive(index: number): boolean {
    return index < this.user.averageRating;
  }

  updateStars() {
    // Trigger re-render of stars on rating change
    console.log(`Current rating: ${this.rating}`);
  }




  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
        const currentRoute = this.router.url;
        if(currentRoute.includes('/my-profile')){
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

        console.log('>>>>>>>>>>>>>');
        console.log(event.url);
        console.log('>>>>>>>>>>>>>');
        if (!event.url.includes('/my-profile')) {
         // console.log('Saliendo de my-profile, limpiando intervalos');
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

    /*if(this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
      console.log("Suscripción al router cancelada correctamente");
    }*/

    if (this.interval) {

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:7,screenTime:this.countSeg}).subscribe((result) => {
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
      //console.log(`my-profile: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      //console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:7,screenTime:this.countSeg}).subscribe((result) => {
        //console.log('DATOS',result);
        
      }, error => {
        
        console.log(error);
      });

      // this.clearInterval();
      return;
    }

   

   
    if (this.isActive2) {
      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg=this.countSeg+differenceInSeconds;
      //console.log(`my-profile: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      //console.log(this.countSeg);


    } 
    else {
     // console.log('my-profile: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }

  goUserTags(){

    this.navCtrl.navigateForward("/usersetags", {state: {userId:this.user.id}});

  }



  redirectToSocial(url: string) {
    // Verifica si la URL es válida y luego redirige al navegador
    if (url) {
      window.location.href = url;
    }
  }

  redirectToWeb(url: string) {
    // Verifica si la URL es válida y luego redirige al navegador
    if (url) {
      window.location.href = url;
    }
  }



  cerrar($modal){
    
    //$modal.dismiss();
    console.log('funcion cerrar');
    this.isModalOpen2 = false;
  }


  onSlideEnd() {
    console.log('You have reached the end of the carousel!');
    //this.getMoreJobs();
    this.getMorePersonalArchives();
  }





  getMorePersonalArchives() {
    this.apiService.obtainPersonalArchives({multimediasIds:this.multimediaIds,language_code:this.language_code}).subscribe((result) => {
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
    this.apiService.obtainPersonalArchives({multimediasIds:this.multimediaIds,language_code:this.language_code}).subscribe((result) => {
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
  

  ngOnDestroy() {
    // this.clearInterval();
  

      if (this.deleteJobChangeSubscription) {
        this.deleteJobChangeSubscription.unsubscribe();
        this.deleteJobChangeSubscription = null;
      }

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
