import { Component, OnInit } from '@angular/core';
import {ModalController, NavController,Platform } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/User';
import { ApiService } from 'src/app/services/api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { codeErrors } from 'src/app/utils/utils';
import { Camera, CameraResultType } from '@capacitor/camera';
import { ImageCropperPage } from '../image-cropper/image-cropper.page';
import { AllImageCropperPage } from '../all-image-cropper/all-image-cropper.page';

import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, tap, filter, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-new-folder',
  templateUrl: './new-folder.page.html',
  styleUrls: ['./new-folder.page.scss'],
})
export class NewFolderPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;

  public user: User;
  public form: FormGroup;
  public base64img: string;

  public rutaImagen:string="assets/imgs/imagen-proyecto.png";

  public uploadProgress:any=0;
  uploadProgressList: { name: string; progress: number; completed: boolean }[] = [];


  public multimediaSelect:any=null;
  public multimedia:any=[];
  public multimediaId:any=[];
  public multimediaIds:any=[];
  public mustimediaCount:number=0;
  public formData: FormData;

  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  isChargeLoading:boolean=false;


  constructor(private http: HttpClient,
    private platform: Platform,
    private navController: NavController,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    //private camera: Camera,
    private translate: TranslateService,
    public auth: AuthenticationService,private modalController: ModalController,
    private router: Router,//SEGUIMIENTO DE TIEMPO
  ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

    this.form = new FormGroup({
      name: new FormControl('',{validators: [Validators.required]}),
      project_id: new FormControl(history.state.projectId),
      image: new FormControl(''),
      multimediaIds:new FormControl(this.multimediaIds),
      language_code: new FormControl('en'),
    });


    //console.log(history.state.projectId);
    //console.log('>>>>>>>>>>>>>>>>');
    //this.form.get('project_id').patchValue(history.state.projectId);

    this.formData = new FormData();


    
  }

  


  ngOnInit() {
    console.log(history.state.projectId);
    console.log('>>>>>>>>>>>>>>>>');
    
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
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.form.patchValue({ language_code: language });
  }

  
  public submitForm(): void {

    //this.utilities.showLoading('');
    this.isChargeLoading=true;

    
    this.form.patchValue({multimediaIds : this.multimediaIds})
    console.log(this.form.value);
    console.log("-----------------------------");
    console.log(this.multimediaIds);
    this.apiService.createFolder(this.form.value).subscribe((result) => {
      this.apiService.foldersChanges.next();
      //setTimeout(() => {
        this.utilities.dismissLoading();
        this.isChargeLoading=false;

      //}, 1000); 
      

      console.log(result['state']);
      if(result['state']=='DATE_ENDED'){
        //this.utilities.dismissLoading();
        this.isChargeLoading=false;

        this.utilities.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));
      }
      else{

        

        //this.utilities.showToast('Carpeta creada con éxito');
        this.translate.get('new-folder.Carpeta creada con éxito').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        //this.navController.pop();
        this.navController.back();
      }
    }, (error) => {
      //this.utilities.dismissLoading();
      this.isChargeLoading=false;

      this.utilities.showToast(this.translate.instant(codeErrors(error)));

    });
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

    this.form.patchValue({image : this.base64img})
    this.rutaImagen = this.base64img;

    // Can be set to the src of an image now
    //imageElement.src = imageUrl;
  }
  






  public async uploadMediaVehicle() {

    if((this.mustimediaCount=this.multimedia.length)<20){
      this.adjuntarMultimediaWeb();
    }else{
      
      this.translate.get('new-folder.Se alcanzó el máximo de subidas permitidas').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
    }
  
  }


  deleteMultimedia($id){
    this.apiService.deleteMultimedia($id).subscribe((result)=>{
     
      console.log(result);
      
      this.translate.get('new-folder.Conetenido multimedia eliminado').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      this.multimedia = this.multimedia.filter(item => item.id !== $id);
      this.mustimediaCount=this.multimedia.length;
      //Encontrar el índice del elemento que coincide con la ID

      this.multimediaId.splice((this.multimediaId.indexOf($id)), 1);
      console.log(this.multimediaId);
      this.form.get('multimediaIds').patchValue(this.multimediaId);
      
    }, error => {
      
      this.translate.get('new-folder.No se pudo eliminar el contenido').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
          console.log(error);
        });
  }





  public adjuntarMultimediaWeb() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
  
    fileInput.addEventListener('change', (event) => {
      const files = (event.target as HTMLInputElement).files;
  
      if (files && files.length > 0) {
        const validExtensions = ['.jpg', '.jpeg', '.png', '.mp4', '.pdf', '.mov', '.MOV'];
        const filesArray = Array.from(files);
  
        const validFiles = filesArray.filter((file) => {
          const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
          const isValid = validExtensions.includes(ext);
          if (!isValid) {
            this.utilities.showToast(`Archivo no permitido: ${file.name}`);
          }
          return isValid;
        });
  
        if (validFiles.length === 0) return;
  
        const maxAllowed = 20 - this.multimedia.length;
        if (maxAllowed <= 0) {
          this.translate.get('Se alcanzó el máximo de archivos permitidos (20)').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText);
          });
          return;
        }
  
        const filesToUpload = validFiles.slice(0, maxAllowed);
       // this.utilities.showLoading();
        this.isChargeLoading=true;

        this.uploadProgressList = [];
  
        let processed = 0;
  
        filesToUpload.forEach((selectedFile, index) => {
          const fileName = selectedFile.name;
  
          this.uploadProgressList.push({ name: fileName, progress: 0, completed: false });
  
          const formData = new FormData();
          formData.append('multimediaFile', selectedFile);
          formData.append('project_id', history.state.projectId);
          formData.append('borrador_contador', this.multimedia.length.toString());
  
          this.http.post(environment.apiUrl + 'multimediaWeb', formData, {
            headers: this.apiService.httpOptionsFiles.headers,
            reportProgress: true,
            observe: 'events'
          }).pipe(
            tap(event => {
              if (event.type === HttpEventType.UploadProgress) {
                const progress = Math.round((100 * event.loaded) / (event.total || 1));
                this.uploadProgressList[index].progress = progress;
                console.log(`📤 Subiendo ${fileName}: ${progress}%`);
              }
            }),
            filter(event => event.type === HttpEventType.Response),
            map((event: any) => event.body)
          ).subscribe(result => {
            this.uploadProgressList[index].completed = true;
  
            if (result['state'] === 'UPLOADED') {
              const nuevo = result['nuevoContenido'];
              this.multimediaIds.push(nuevo?.id);
              this.form.get('multimediaIds').patchValue(this.multimediaIds);
              this.multimedia.push(nuevo);
  
              this.translate.get('new-folder.Nuevo contenido subido correctamente')
                .subscribe((text) => {
                  this.utilities.showToast(text);
                });
  
            } else if (result['state'] === 'NOTALLOWED') {
              this.abrirModalInvitado();
            }
  
            processed++;
            if (processed === filesToUpload.length) {
              //this.utilities.dismissLoading();
              this.isChargeLoading=false;

              setTimeout(() => this.uploadProgressList = [], 1000);
            }
  
          }, error => {
            console.error('Error al cargar archivo:', error);
            processed++;
            if (processed === filesToUpload.length) {
             // this.utilities.dismissLoading();
              this.isChargeLoading=false;

              setTimeout(() => this.uploadProgressList = [], 1000);
            }
          });
        });
      }
    });
  
    fileInput.click();
  }
  



  public adjuntarMultimediaWebANTERIOR() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
  
    fileInput.addEventListener('change', (event) => {
      const files = (event.target as HTMLInputElement).files;
  
      if (files && files.length > 0) {
        const validExtensions = ['.jpg', '.jpeg', '.png', '.mp4', '.pdf','.mov','.MOV'];
        const filesArray = Array.from(files);
  
        const validFiles = filesArray.filter((file) => {
          const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
          const isValid = validExtensions.includes(ext);
          if (!isValid) {
            this.utilities.showToast(`Archivo no permitido: ${file.name}`);
          }
          return isValid;
        });
  
        // No archivos válidos
        if (validFiles.length === 0) return;
  
        // Control de cantidad máxima
        const maxAllowed = 20 - this.multimedia.length;
        if (maxAllowed <= 0) {
          this.translate.get('Se alcanzó el máximo de archivos permitidos (20)').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText);
          });
          return;
        }
  
        const filesToUpload = validFiles.slice(0, maxAllowed);
  
        //this.utilities.showLoading('');
        this.isChargeLoading=true;

  
        let processed = 0;
  
        filesToUpload.forEach((selectedFile) => {
          const formData = new FormData();
          formData.append('multimediaFile', selectedFile);
          formData.append('project_id', history.state.projectId);
          formData.append('borrador_contador', this.multimedia.length);
  
          this.apiService.multimediaWeb(formData).subscribe((result) => {
            if (result['state'] === 'UPLOADED') {
              const nuevo = result['nuevoContenido'];
              this.multimediaIds.push(nuevo?.id);
              this.form.get('multimediaIds').patchValue(this.multimediaIds);
              this.multimedia.push(nuevo);
  
              this.translate.get('new-folder.Nuevo contenido subido correctamente').subscribe((text) => {
                this.utilities.showToast(text);
              });
  
            } else if (result['state'] === 'NOTALLOWED') {
              this.abrirModalInvitado();
            }
  
            processed++;
            if (processed === filesToUpload.length) {
              //this.utilities.dismissLoading();
              this.isChargeLoading=false;

            }
  
          }, error => {
            console.error('Error al cargar archivo:', error);
            processed++;
            if (processed === filesToUpload.length) {
             // this.utilities.dismissLoading();
              this.isChargeLoading=false;

            }
          });
        });
      }
    });
  
    fileInput.click();
  }
  



  public  adjuntarMultimediaWebelqueibabien(){
    
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.addEventListener('change', (event) => {

      
      const files = (event.target as HTMLInputElement).files;

      if (files && files.length > 0) {
       // this.utilities.showLoading('');
        this.isChargeLoading=true;

        
        console.log('--------------------------');
        Array.from(files).forEach((selectedFile) => {
          console.log('>>>>>>>>>>>>>>>>>>>');
          console.log(selectedFile);
          console.log('>>>>>>>>>>>>>>>>>>>');

          /*if (this.isImage(selectedFile)) {
            // El archivo es una imagen
            console.log('El archivo es una imagen:', selectedFile.name);
            // Aquí puedes realizar acciones adicionales con el archivo de imagen
          } else {
            // El archivo no es una imagen
            console.log('El archivo no es una imagen:', selectedFile.name);
            return;
          }*/
          if((this.mustimediaCount=this.multimedia.length)<20){

            // Crear un nuevo FormData para cada archivo
            const formData = new FormData();
            formData.append('multimediaFile', selectedFile);
            formData.append('project_id',history.state.projectId);
            formData.append('borrador_contador',this.multimedia.length);
            //formData.append('vehicle_id', null);

            // Realizar la llamada a la API para subir cada archivo
            this.apiService.multimediaWeb(formData).subscribe((result) => {
              console.log('DATOS', result);
              if(result['state']=='UPLOADED'){
              this.multimediaIds.push(result['nuevoContenido']?.id);
              console.log(this.multimediaIds);
              this.form.get('multimediaIds').patchValue(this.multimediaId);

              // Manejo de la respuesta y actualización de la interfaz de usuario
              //this.utilities.dismissLoading();
              this.isChargeLoading=false;


              // Agregar el resultado a la lista multimedia
              this.multimedia.push(result['nuevoContenido']);
              console.log(this.multimedia);

              // Actualizar el contador multimedia
              this.mustimediaCount = this.multimedia.length;

              // Mostrar mensaje de éxito
              this.translate.get('new-folder.Nuevo contenido subido correctamente').subscribe((translatedText: string) => {
                this.utilities.showToast(translatedText); 
              });

              }
              else if(result['state']=='NOTALLOWED'){
                //this.utilities.dismissLoading();
                this.isChargeLoading=false;

                this.abrirModalInvitado(); 

              }


            }, error => {
              console.log('Error al cargar archivos:', error);
             // this.utilities.dismissLoading();
              this.isChargeLoading=false;

              // Manejar el error adecuadamente
            });

          }//comprobacion cantidad
        });

        //this.utilities.dismissLoading();
        this.isChargeLoading=false;

      }
    });
    
      fileInput.click(); // Abre el cuadro de diálogo de selección de archivos
    
  }



  async openImageCropper(multimedia:any) {

    console.log(">>>>>>>>>>>>");

    this.multimediaSelect=multimedia;
    const imageRuta=multimedia.archive;
    const multimedia_id=multimedia.id;

    if(this.isImageFile(imageRuta)){

      console.log(">>>>>>>>>>>>2");
    const modal = await this.modalController.create({
      component: ImageCropperPage,
      componentProps: { imageRuta,multimedia_id }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        console.log('Cropped Image:', result.data);

        if(result.data.croppedImageFile!=null ){
        // Aquí puedes manejar la imagen recortada
        this.multimediaSelect=result.data.croppedImageFile;
       console.log(">>>>>>>>>>");
        console.log(this.multimediaSelect);



        console.log(this.multimedia);
          const index = this.multimedia.findIndex(m => m.id === multimedia_id);
          if (index !== -1) {
            this.multimedia[index] = this.multimediaSelect;
          }

          


          console.log(this.multimedia);
        }


      }
    });

    return await modal.present();
    }
    else{
      console.log('No es una imagen');
    }
  }




  isImageFile(imageRuta) {
    // Extensiones válidas para imágenes
    const validExtensions = ['jpeg', 'jpg', 'png', 'bmp', 'webp','JPEG', 'JPG', 'PNG', 'BMP', 'WEBP'];
  
    // Decodificar JSON si es una cadena
    if (typeof imageRuta === 'string') {
      imageRuta = JSON.parse(imageRuta);
    }
  
    // Comprobar cada objeto en el array
    return imageRuta.some((item) => {
      const downloadLink = item.download_link;
      const extension = downloadLink.split('.').pop().toLowerCase();
      return validExtensions.includes(extension);
    });
  }


  goBack(){
    this.navController.pop();
    // this.navCtrl.navigateBack(history.state.origen);
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
          this.rutaImagen =this.base64img;
          this.form.patchValue({image : this.base64img})
        }


      }
    });

    return await modal.present();
   // }
    //else{
      //console.log('No es una imagen');
    //}
  }


  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
        const currentRoute = this.router.url;
        if(currentRoute.includes('/new-folder')){
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
        if (!event.url.includes('/new-folder')) {
        //  console.log('Saliendo de new-folder, limpiando intervalos');
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
      this.apiService.registerTimeScreen({screenId:34,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`new-folder: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:34,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`new-folder: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('new-folder: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }

  

  async abrirModalInvitado(){


    let titleText=this.translate.instant('new-folder.Máximo alcanzado');
    let infoText=this.translate.instant('new-folder.Hazte con el plan 360 para subir contenido de forma ilimitada');
  
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
        this.navController.pop();
       }

    
      });

    return await modal.present();
  }

}

