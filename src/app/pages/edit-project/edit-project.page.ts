import { Component, OnInit } from '@angular/core';
import {AlertController, IonToggle, ModalController, NavController,Platform } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/User';
import { ApiService } from 'src/app/services/api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { codeErrors } from 'src/app/utils/utils';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { AllImageCropperPage } from '../all-image-cropper/all-image-cropper.page';
import { ViewChild, ElementRef } from '@angular/core';
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';

import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.page.html',
  styleUrls: ['./edit-project.page.scss'],
})
export class EditProjectPage implements OnInit {


  //@ViewChild('buttonToggle', { read: ElementRef }) buttonToggle: ElementRef;
  @ViewChild('buttonToggle', { static: false }) buttonToggle: IonToggle;


  isAndroid: boolean = false;
  isIOS: boolean = false;
  showKeyCode : boolean = false;
  public theProjectId:any=null;
  public theProject:any=null;
  public user: User;
  public form: FormGroup;
  public base64img: string;

  private language_code:string='en';

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
    private alertController: AlertController,
  ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

    this.form = new FormGroup({
      id: new FormControl(-1),
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

  

  public ionViewWillEnter(){


    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
        const currentRoute = this.router.url;
        if(currentRoute.includes('/edit-project')){
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
        if (!event.url.includes('/edit-project')) {
         // console.log('Saliendo de edit-project, limpiando intervalos');
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
  
    

    this.theProjectId=history.state.projectId;
    if(this.theProjectId){
      this.form.patchValue({id:this.theProjectId});
    }
    
    console.log("ENTRO EN VIEW ENTER");
    
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.language_code=language;
    this.form.patchValue({ language_code: language });
    this.obtainProject();
  }



  obtainProject(){

    console.log("ENTRO EN obtainProject");
    if(this.theProjectId!=null){
      this.apiService.obtainProject({projectId:this.theProjectId,withBase64:true,language_code:this.language_code}).subscribe((result) => {
        console.log('Result obtainProject:',result);
        this.theProject=result;
        console.log(this.theProject);


        if(this.theProject?.isCreator==false && this.theProject?.isProjectActive==false){
          this.utilities.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));
        }


        if(this.theProject.base64Image==null){
          this.form.patchValue({avatar : ''});
          this.rutaImagen = 'assets/imgs/imagenDefectoProyecto.png';
          this.base64img=null
        
        }
        else{
        
          this.form.patchValue({avatar : 'data:image/jpeg;base64,'+this.theProject.base64Image});
          this.rutaImagen = 'data:image/jpeg;base64,'+this.theProject.base64Image;
          this.base64img='data:image/jpeg;base64,'+this.theProject.base64Image;
          console.log("IMAGEN DE BASE64");
          console.log(this.rutaImagen);
        }
        
        this.form.patchValue({name : this.theProject.name_project});
        this.form.patchValue({description : this.theProject.description});
        
        if(this.theProject.keyCode){
          this.form.patchValue({keyCode : this.theProject.keyCode});
          this.buttonToggle.checked = true;
        }
        else{
          this.buttonToggle.checked = false;
          
        }

        this.form.patchValue({dateEnd : this.theProject.end_date});

       
       
        
      }, error => {
        
        this.translate.get('edit-project.No se obtuvieron las carpetas del proyecto').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        console.log(error);
        //this.actu=true;
        
      });

    }


  }

  
  public async submitForm(): Promise<void> {

    // Obtener la fecha seleccionada del formulario
    const selectedDate = new Date(this.form.get('dateEnd')?.value);
    const currentDate = new Date();

    // Comparar la fecha seleccionada con la fecha actual
    if (selectedDate <= currentDate) {

      this.translate.get('edit-project.La fecha de finalización debe ser posterior a la fecha actual').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });

      return; // Evitar continuar si la fecha no es válida
    }

    console.log("---------------");
    console.log(this.form.value);

    // Si la fecha es válida, continuar con la creación del proyecto
    this.isChargeLoading=true;

    //await this.utilities.showLoading('');
    this.apiService.updateProject(this.form.value).subscribe(async (result) => {

      if (result['state'] === 'UPDATED') {
        console.log("entro dentro");
        // await this.esperar(250);
        this.isChargeLoading=false;
        //this.utilities.dismissLoading();
        this.apiService.projectsChanges.next();
        this.translate.get('edit-project.Proyecto actualizado').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });

        setTimeout(() => {
          this.goBack();
        }, 200);
        
        //this.navController.navigateForward("/add-participants", { state: { newProject: result['newProject'] } });
      } 
      if (result['state'] ==='SUB_NOT_ALLOWED'){
        // await this.esperar(250);
        this.isChargeLoading=false;

        //this.utilities.dismissLoading();
        this.abrirModalInvitado();
      }
      else if (result['state'] ==='DATE_ENDED'){
        // await this.esperar(250);
        this.isChargeLoading=false;

        //this.utilities.dismissLoading();
        this.utilities.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));
      }
      else {
       //  await this.esperar(250);
       this.isChargeLoading=false;

        //this.utilities.dismissLoading();
        console.log("respuesta inesperada");
        console.log(result['state']);
        console.log("--------------------");
      }

    }, async (error) => {
       //await this.esperar(250);
       this.isChargeLoading=false;

      //this.utilities.dismissLoading();
      this.utilities.showToast(this.translate.instant(codeErrors(error)));
    });
}


  goBack(){

    if(history.state.fromEdit!=null){
      this.navCtrl.navigateBack('/tabs/workspace');    }
    else{
      this.navCtrl.pop();
    }

    //ANTESS this.navCtrl.pop()
    
  }

  public async adjuntarImagen() {
    // Detectar si estamos en plataforma web
    if (Capacitor.isNativePlatform()) {
      // Funcionalidad para plataformas nativas (iOS/Android)
      await this.adjuntarImagenNativa();
    } else {
      // Funcionalidad para web
      this.adjuntarImagenWeb();
    }
  }

  private async adjuntarImagenNativa() {
    const permissions = await Camera.requestPermissions();

    if(permissions.photos === 'denied' || permissions.camera === 'denied') {
      console.log("permiso camera " , permissions);
      return;
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

  private adjuntarImagenWeb() {
    // Crear input file temporal para web
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.base64img = e.target.result;
          this.form.patchValue({avatar : this.base64img})
          this.rutaImagen = this.base64img;
          console.log("imagen web " ,this.base64img);
        };
        reader.readAsDataURL(file);
      }
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }
  
  async openAllImageCropper() {

    if(this.rutaImagen=='assets/imgs/imagenDefectoProyecto.png'){

    }
    else{

      console.log(">>>>>>>>>>>>");

    
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
  }


  toggleKeyCode(event: any) {
    this.showKeyCode = event.detail.checked;
    console.log("Toggle state:", this.showKeyCode); 
    if(!this.showKeyCode){
      this.form.patchValue({ keyCode: null });
    }
  }


  public deleteProject(){

    // Obtener la fecha seleccionada del formulario
    const selectedDate = new Date(this.form.get('dateEnd')?.value);
    const currentDate = new Date();

    

   

    // Si la fecha es válida, continuar con la creación del proyecto
    this.apiService.deleteProject({id:this.theProjectId}).subscribe((result) => {
      if (result['state'] ==='NOT_FOUND'){
        
       
        this.translate.get('edit-project.Proyecto indicado ya no existe').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        this.navCtrl.navigateRoot("/workspace");
      }
      if (result['state'] ==='NOT_ALLOWED'){
        
       
        this.translate.get('edit-project.Solo el creador del proyecto puede borrarlo').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        
      }
      if (result['state'] ==='SUB_NOT_ALLOWED'){
        this.abrirModalInvitado();
      }
      else if (result['state'] ==='DATE_ENDED'){
       
        this.utilities.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));
      }
      else if (result['state'] === 'DELETED') {
        console.log("entro dentro");
        this.apiService. projectsChanges.next();
       
        this.translate.get('edit-project.Proyecto eliminado').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        this.navCtrl.navigateRoot("/tabs/workspace");
        
        //this.navController.navigateForward("/add-participants", { state: { newProject: result['newProject'] } });
      } else {
        console.log("respuesta inesperada");
        console.log(result['state']);
        console.log("--------------------");
      }

    }, (error) => {
      this.utilities.showToast(this.translate.instant(codeErrors(error)));
    });
  }


  goEditProject(){

   

    if(this.theProject?.isCreator==true || (this.theProject?.isVerifiedUser==true && this.theProject?.isAdmin==true)){
       console.log('Redireccionando a participants-list, pansando:',{projectId:this.theProjectId,modifyAllowed:true, creator:this.theProject.creator});
      this.navController.navigateForward("/participants-list", {state: {projectId:this.theProjectId,modifyAllowed:true,creator:this.theProject.creator}});

    }
    else{
       console.log('Redireccionando a participants-list, pansando:',{projectId:this.theProjectId,modifyAllowed:false,creator:this.theProject.creator});
      this.navController.navigateForward("/participants-list", {state: {projectId:this.theProjectId,modifyAllowed:false,creator:this.theProject.creator}});

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
      this.apiService.registerTimeScreen({screenId:31,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`edit-project: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:31,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`edit-project: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('edit-project: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }






  async mostrarAlertaBorrado() {
    const alert = await this.alertController.create({
      header:this.translate.instant('edit-project.Eliminar proyecto'),
      message: this.translate.instant('edit-project.¿Estás seguro de querer eliminar el proyecto?'),
      cssClass: 'custom-button-class',
      buttons: [
        {
          text: this.translate.instant('edit-project.Cancelar'),
          role: 'cancel',
          cssClass: 'custom-button-class',
          handler: () => {
            console.log('Clic en Cancelar');
          }
        },
        {
          text: this.translate.instant('edit-project.Aceptar'),
          cssClass: 'custom-button-class',
          handler: () => {
            console.log('Clic en Aceptar');
            this.deleteProject();
            
            
           
          },
          //cssClass: 'custom-button-class' 
        }
      ]
    });

    await alert.present();
  }


  async abrirModalInvitado(){


    let titleText=this.translate.instant('edit-project.Sin Suscripción válida');
    let infoText=this.translate.instant('edit-project.Hazte con el plan 360 para crear y administrar proyectos');

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
        this.goBack();
       }

    
    });


    return await modal.present();
  }

  goPermissions(){
    this.theProject
    this.navController.navigateForward("/grant-permissions", {state: {newProject:this.theProject}});
  }


  async esperar(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
