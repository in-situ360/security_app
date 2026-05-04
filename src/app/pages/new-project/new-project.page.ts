import { Component, OnInit } from '@angular/core';
import {ModalController, NavController,Platform } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/User';
import { ApiService } from 'src/app/services/api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { codeErrors } from 'src/app/utils/utils';
import { Camera, CameraResultType } from '@capacitor/camera';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { AllImageCropperPage } from '../all-image-cropper/all-image-cropper.page';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.page.html',
  styleUrls: ['./new-project.page.scss'],
})
export class NewProjectPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;
  showKeyCode : boolean = false;

  public user: User;
  public form: FormGroup;
  public base64img: string;

  public rutaImagen:string="assets/imgs/imagen-proyecto.png";


  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------
  isChargeLoading:boolean=false;

  constructor(
    private platform: Platform,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    //private camera: Camera,
    public auth: AuthenticationService,
    public navController:NavController,
    public navCtrl: NavController,
    private modalController: ModalController,
    private translate: TranslateService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
  ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''/*, [Validators.required]*/),
      avatar: new FormControl(''/*, [Validators.required]*/),
      keyCode: new FormControl(''/*, [Validators.required]*/),
      dateEnd: new FormControl('', [Validators.required]),
      language_code: new FormControl('en'),

    });

  }

  ngOnInit() {
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

    //
  }


  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.form.patchValue({ language_code: language });
  }


  public submitForm(): void {

    // Obtener la fecha seleccionada del formulario
    const selectedDate = new Date(this.form.get('dateEnd')?.value);
    const currentDate = new Date();

    // Comparar la fecha seleccionada con la fecha actual
    if (selectedDate <= currentDate) {
      this.translate.get('new-project.La fecha de finalización debe ser posterior a la fecha actual').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      return; // Evitar continuar si la fecha no es válida
    }

    console.log("---------------");
    console.log(this.form.value);

    //this.utilities.showLoading();
    this.isChargeLoading=true;
    // Si la fecha es válida, continuar con la creación del proyecto
    this.apiService.createProject(this.form.value).subscribe((result) => {
      

      if (result['state'] === 'COINCIDENCE') {
        this.isChargeLoading=false;
        //this.utilities.dismissLoading();
        this.translate.get('new-project.Ya tienes un proyecto con ese nombre').subscribe((translatedText: string) => {
          
          this.utilities.showToast(translatedText); 
        });
      } else if (result['state'] === 'CREATED') {
        console.log("entro dentro");
        //this.utilities.dismissLoading();
        this.isChargeLoading=false;
        
        this.translate.get('new-project.Proyecto creado con éxito').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        this.navController.navigateRoot("/add-participants", { state: { newProject: result['newProject'],fromNewProject:true } });
      } 
      else if (result['state'] === 'NOTALLOWED') {
        //this.utilities.dismissLoading();
        this.isChargeLoading=false;
        this.abrirModalInvitado(); 
      }
      else {
        this.isChargeLoading=false;
        //this.utilities.dismissLoading();
        console.log("respuesta inesperada");
        console.log(result['state']);
        console.log("--------------------");
      }

    }, (error) => {
      this.isChargeLoading=false;
      //this.utilities.dismissLoading();
      this.utilities.showToast(this.translate.instant(codeErrors(error)));
    });
}


  goBack(){

    //ANTESS this.navCtrl.pop()
    this.navCtrl.pop();
  }

  public async adjuntarImagen() {

    const permissions = await Camera.requestPermissions();


    if(permissions.photos === 'denied' || permissions.camera === 'denied') {
      console.log("permiso camera " , permissions);
      
    }
    const image = await Camera.getPhoto({
      promptLabelHeader: 'Fotos',
      promptLabelCancel: 'Cancelar',
      promptLabelPhoto: 'Galería',
      promptLabelPicture: 'Cámara',
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64
    });
  
    console.log(image);
    
    // image.webPath will contain a path that can be set as an image src.
    // You can access the original file using image.path, which can be
    // passed to the Filesystem API to read the raw data of the image,
    // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
    this.base64img = 'data:image/jpeg;base64,' + image.base64String;
  
    console.log("imagen " ,this.base64img);

    this.form.patchValue({avatar : this.base64img})
    this.rutaImagen = this.base64img;

    // Can be set to the src of an image now
    //imageElement.src = imageUrl;
  }
  
  async openAllImageCropper() {

    console.log(">>>>>>>>>>>>");

    if(this.base64img==null || this.base64img==''){
      return;
    }

  
    const imageRuta=this.base64img;
    
   

    //if(this.isImageFile(imageRuta)){

      console.log(">>>>>>>>>>>>2");
    const modal = await this.modalController.create({
      component: AllImageCropperPage,
      componentProps: { imageRuta }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        console.log('Cropped Image:', result.data);

        if(result.data.croppedImageFile!=null ){
          this.base64img=result.data.croppedImageFile;


          console.log("dios que funcione>>>>>>>>>>>>");

          console.log(this.base64img);
          //this.rutaImagen =this.base64img;

          this.form.patchValue({ avatar: this.base64img });
          this.rutaImagen = this.base64img;
         //this.form.patchValue({image : this.base64img})
        }


      }
    });

    return await modal.present();
   // }
    //else{
      //console.log('No es una imagen');
    //}
  }


  toggleKeyCode(event: any) {
    this.showKeyCode = event.detail.checked;
    console.log("Toggle state:", this.showKeyCode); 
    if(!this.showKeyCode){
      this.form.patchValue({ keyCode: null });
    }
  }


















  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
        const currentRoute = this.router.url;
        if(currentRoute.includes('/new-project')){
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
        if (!event.url.includes('/new-project')) {
     //     console.log('Saliendo de new-project, limpiando intervalos');
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
      this.apiService.registerTimeScreen({screenId:13,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`new-project: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:13,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`new-project: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('new-project: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }




  async abrirModalInvitado(){


    let titleText=this.translate.instant('new-project.Sin Suscripción válida');
    let infoText=this.translate.instant('new-project.Hazte con el plan 360 para crear y administrar proyectos');

    const modal = await this.modalController.create({
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
