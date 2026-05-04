import { Component, OnInit } from '@angular/core';
import {AlertController, InfiniteScrollCustomEvent, ModalController, NavController,Platform } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ModalMultimediaPage } from '../modal-multimedia/modal-multimedia.page';
import { ImageCropperPage } from '../image-cropper/image-cropper.page';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import { codeErrors } from 'src/app/utils/utils';
import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';

import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, tap, filter, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ModalEditFolderPage } from '../modal-edit-folder/modal-edit-folder.page';
import { ModalMenuFolderPage } from '../modal-menu-folder/modal-menu-folder.page';
import { formatDate } from '@angular/common';
import { SelectFolderoptionsModalPage } from '../select-folderoptions-modal/select-folderoptions-modal.page';
@Component({
  selector: 'app-new-folder-content',
  templateUrl: './new-folder-content.page.html',
  styleUrls: ['./new-folder-content.page.scss'],
})
export class NewFolderContentPage implements OnInit {

  
  isAndroid: boolean = false;
  isIOS: boolean = false;
  public projectId:any = null; 
  public folderId=null;
  public permission:any=1;

  public isDateEnded:boolean=false;

  public theFolder:any=null;
  public folderName:any='';
  public multimedias:any=[];
  public multimediaIds: any = [];

  public language_code:string='en';

  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  public uploadProgress:any=0;
  uploadProgressList: { name: string; progress: number; completed: boolean }[] = [];

  public seleccionando: boolean = false; // Controla si se está en modo selección
  public multimediaSeleccionados: Set<number> = new Set(); // Guarda los IDs seleccionados
  public carpetasSeleccionadas: Set<number> = new Set();
  

  private folderChangeSubscription: Subscription | null = null;
  private mediaActivatedSubscription: Subscription | null = null;
  public photoActivatedSubscription: Subscription | null = null;


  public form: FormGroup;
  public base64img: string;

  showOverlay:boolean=false;
  private pressTimer: any;

  option={
    slidesPerView:1.5,
    centeredSlides:true,
    loop:false,//true
    spaceBetween:10,
    //autoplay:true,
    initialSlide: 0,
  }


  public isModalOpen2:any = false;


  public creator:boolean=false;
  public isVerifiedUser:boolean=false;
  public isAdmin:boolean=false;

  isChargeLoading:boolean=false;


  constructor(private http: HttpClient,
    private platform: Platform,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private modalCtrl: ModalController,
    //private camera: Camera,
    private translate: TranslateService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
    public auth: AuthenticationService,
    public navController:NavController,
    public modalController:ModalController,
    private alertCtrl: AlertController,
  ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');
    /*console.log("folderId:",history.state.folderId);
    this.folderId=history.state.folderId;
    this.projectId=history.state.projectId;
    console.log('ID DEL PROYECTO: ',this.projectId);

    this.creator=history.state.creator;
    this.isVerifiedUser=history.state.isVerifiedUser;
    this.isAdmin=history.state.isAdmin;*/


  }

 ngOnInit(){}

  ionViewWillEnter() {

    console.log("ionViewWillEnter");

    
      console.log("folderId:",history.state.folderId);
      this.folderId=history.state.folderId;
      this.projectId=history.state.projectId;
      console.log('ID DEL PROYECTO: ',this.projectId);

      this.creator=history.state.creator;
      this.isVerifiedUser=history.state.isVerifiedUser;
      this.isAdmin=history.state.isAdmin;

    

    




    console.log(this.translate.langs.length);
    
    if (this.translate.langs.length == 0) {
      console.log("No idioma");
    
      this.utilities.saveLang('en');
    }
    else{
      const currentLang = this.translate.currentLang;
      console.log("Idioma actual:", currentLang);
      this.language_code=currentLang;
      //this.form.patchValue({ language_code: currentLang });
    }
    this.obtainFolderData();

    if(!this.folderChangeSubscription) {
      this.folderChangeSubscription =this.apiService.folderChanges.subscribe((folder) => {
        
        if(folder.type=='update'){

          //console.log(this.theFolder);
          //console.log(folder.folder);
          //console.log("-----------------");
          if(this.theFolder.id==folder.folder.id){
            //console.log("FOLDERCONTENT-->", folder);
            this.theFolder.name=folder.folder.name;
            this.folderName=folder.folder.name;
          }
          else if(this.theFolder.id==folder.folder.folder_id){
            //Tengo que encontrar en el listado de multimedia el folder con esa id y cambiar su nombre
            //ademas de la id , que compruebe si thetype=="folder" a la hora de encontrar coincidencias
            const index = this.multimedias.findIndex(item => item.id === folder.folder.id && item.thetype === "folder");
            if (index !== -1) {
              this.multimedias[index].name = folder.folder.name;
              console.log('Nombre de la carpeta actualizado en el array multimedias:', folder.folder.name);
            }

          }
          /*const index = this.multimedias.findIndex(item => item.id === pa.id);
          if (index !== -1) {
            this.multimedias[index] = pa;
            console.log('Archivo personal actualizado en el array multimedias:', pa);
          }*/

        }
        else if(folder.type=='create'){

          if(folder.folder.folder_id==this.folderId){
            console.log('FOLDERCONTENT:', folder.folder);
            this.multimedias.unshift(folder.folder);
          }
          

        }
        else if(folder.type=='newLink'){

          if(folder.link.folder_id==this.folderId){
            console.log('FOLDERCONTENT:', folder.link);
            this.multimedias.unshift(folder.link);
          }
          

        }
        
      });
    }

    

    if (!this.mediaActivatedSubscription) {
      this.mediaActivatedSubscription = this.apiService.mediaActivated.subscribe(funcion => {
        this.uploadMedia();
      });  
    }

    if(!this.photoActivatedSubscription){
      
      this.photoActivatedSubscription=this.apiService.photoActivated.subscribe(funcion => {
        this.adjuntarImagen();
      });  

    }

  
    
    this.form = new FormGroup({
      image: new FormControl('', [Validators.required]),
      folderId: new FormControl(''/*, [Validators.required]*/),
      projectId: new FormControl(''/*, [Validators.required]*/),
    });
    
  }

  

  /*public ionViewWillEnter(){


    console.log("SE EJECUTA ionViewWillEnter");

  App.addListener('appStateChange', (state) => {
   // console.log("se lanza evento ACTIVO/INACTIVO");
    this.isActive2=state.isActive;
    if(this.isActive2){
     // console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
      //this.startInterval();
    }
    else{
      //this.clearInterval();

    }
    
  });

  this.routerSubscription = this.router.events.subscribe((event) => {
    if (event instanceof NavigationEnd) {
      // Verifica si la ruta actual no es '/UserSearch'
      if (!event.url.includes('/folder-content')) {
       // console.log('Saliendo de folder-content, limpiando intervalos');
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

   
  }*/

  obtainFolderData(){

    this.multimedias=[];
    this.multimediaIds=[];
    this.seleccionando = false; // Controla si se está en modo selección
    this.multimediaSeleccionados= new Set(); // Guarda los IDs seleccionados
    this.carpetasSeleccionadas= new Set();
    
    this.apiService.obtainFolderData({folderId:this.folderId,multimediasIds:this.multimediaIds,language_code:this.language_code}).subscribe((result) => {
      console.log('Result',result);


      if(result['state'] && result['state']=='DATE_ENDED'){
        this.isDateEnded=true;
        this.utilities.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));

      }
      else if(result['state'] && result['state']=='WITHOUT_PERMISSION'){
        this.isDateEnded=true;
        this.utilities.showToast(this.translate.instant("No tiene permiso para acceder al contenido de esta carpeta"));

      }
      else{

        this.isDateEnded=false;
        this.theFolder=result['folder'];

       

        this.projectId=this.theFolder?.project_id;
        console.log('ID DEL PROYECTO: ',this.projectId);
        this.creator=this.theFolder?.creator;

        this.permission=result['permission'];

        this.folderName=this.theFolder.name;
        this.multimedias=this.multimedias.concat(result['subFolders']);
        this.multimedias=this.multimedias.concat(result['multimedias']);//concadenar listado 

        this.multimediaIds=this.multimediaIds.concat(result['multimediaIds']);//añado nuevos ids

        console.log('listado multimedia',this.multimedias);
      }
     
      
    }, error => {
      
      this.translate.get('folder-content.No se obtuvo las carpetas del proyecto').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
      //this.actu=true;
      
    });
  }

  goBack(){
    console.log("(new-folder-content)Volviendo a la página anterior");
    //this.navController.pop();
    this.navController.back();
  }


  

  async abrirModalMultimedia($media,$type,$id,$multimedia){

    if(this.seleccionando!=true){

      let name=this.extractOriginalName($multimedia);

      const modal = await this.modalCtrl.create({
        component: ModalMultimediaPage,
        cssClass: 'MultimediaModal',
        componentProps: {
          mediaArchive: $media,
          mediaType:$type,
          id:$id,
          pdfName:name,
        },
      // backdropDismiss:false
      });
      return await modal.present();
    }
  }

  async abrirModalMultimedia1($media,$type,$id){

    if(this.seleccionando!=true){

      const modal = await this.modalCtrl.create({
        component: ModalMultimediaPage,
        cssClass: 'MultimediaModal',
        componentProps: {
          mediaArchive: $media,
          mediaType:$type,
          id:$id,
          pdfName:'',
        },
      // backdropDismiss:false
      });
      return await modal.present();
    }
  }





  public async uploadMedia() {

    
      this.adjuntarMultimediaWeb();
    
  
  }






  public adjuntarMultimediaWebelqueibabien() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.png, .jpg, .jpeg, .mp4, .pdf'; // Solo se permiten estas extensiones
    fileInput.multiple = true;
  
    fileInput.addEventListener('change', (event) => {
      const files = (event.target as HTMLInputElement).files;
  
      if (files && files.length > 0) {
        const validExtensions = ['.png', '.jpg', '.jpeg', '.mp4', '.pdf', '.MOV','.mov'];
  
        //this.utilities.showLoading('');
        this.isChargeLoading=true;

        console.log('--------------------------');
  
        Array.from(files).forEach((selectedFile) => {
          const fileName = selectedFile.name;
          const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2); // tamaño en MB
          const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  
          // Mostrar toast con información del archivo
         // this.utilities.showToast(`Archivo seleccionado: ${fileName} (${extension}, ${fileSizeMB} MB)`);
  
          // Validar extensión
          const isValid = validExtensions.includes(extension);
          if (!isValid) {
            console.warn(`Archivo no permitido: ${fileName}`);
            const message = this.translate.instant("Tipo de archivo no permitido") + `: ${fileName}, ` + this.translate.instant("se excluirá del listado");
            this.utilities.showToast(message);
            
            /*setTimeout(async () => {
        
              this.utilities.dismissLoading();
            }, 500);*/
            return;
          }
  
          console.log('>>>>>>>>>>>>>>>>>>>');
          console.log(selectedFile);
          console.log('>>>>>>>>>>>>>>>>>>>');
  
          // Crear FormData y subir
          const formData = new FormData();
          formData.append('multimediaFile', selectedFile);
          formData.append('project_id', this.projectId);
          formData.append('folder_id', this.folderId);
          formData.append('language_code', this.language_code);
  
          this.apiService.multimediaWeb(formData).subscribe((result) => {
            console.log('DATOS', result);
  
            if (result['state'] === 'UPLOADED') {
              this.multimediaIds.push(result['nuevoContenido']?.id);
  
              const m = result['nuevoContenido'];
              //this.utilities.dismissLoading();
              this.isChargeLoading=false;

              this.multimedias.unshift(m);
              console.log(this.multimedias);
              //this.openImageCropper(m);
  
              this.translate.get('folder-content.Nuevo contenido subido correctamente')
                .subscribe((translatedText: string) => {
                  this.utilities.showToast(translatedText);
                });
  
            } else if (result['state'] === 'NOTALLOWED') {
              setTimeout(async () => {
                //this.utilities.dismissLoading();
                this.isChargeLoading=false;

                this.abrirModalInvitado();
              }, 500);
              
            }
  
          }, error => {
            console.log('Error al cargar archivos:', error);
            setTimeout(async () => {
             // this.utilities.dismissLoading();
              this.isChargeLoading=false;

            }, 500);
          });
        });
  
        setTimeout(async () => {
         // this.utilities.dismissLoading();
          this.isChargeLoading=false;

        }, 500);
      }
    });
  
    fileInput.click(); // Abre el cuadro de diálogo de selección de archivos
  }

  public adjuntarMultimediaWeb() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.png, .jpg, .jpeg, .mp4, .pdf';
    fileInput.multiple = true;
  
    fileInput.addEventListener('change', (event) => {
      const files = (event.target as HTMLInputElement).files;
  
      if (files && files.length > 0) {
        const validExtensions = ['.png', '.jpg', '.jpeg', '.mp4', '.pdf', '.mov'];
        const filesArray = Array.from(files);
  
        const validFiles = filesArray.filter(file => {
          const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
          const isValid = validExtensions.includes(ext);
          if (!isValid) {
            const message = this.translate.instant("Tipo de archivo no permitido") + `: ${file.name}, ` + this.translate.instant("se excluirá del listado");
            this.utilities.showToast(message);
          }
          return isValid;
        });
  
        if (validFiles.length === 0) return;
  
       // this.utilities.showLoading('');
        this.isChargeLoading=true;

        this.uploadProgressList = []; // reset progress
  
        let processedCount = 0;
  
        validFiles.forEach((selectedFile, index) => {
          const fileName = selectedFile.name;
  
          // Inicializar barra individual
          this.uploadProgressList.push({ name: fileName, progress: 0, completed: false });
  
          const formData = new FormData();
          formData.append('multimediaFile', selectedFile);
          formData.append('project_id', this.projectId);
          formData.append('folder_id', this.folderId);
          formData.append('language_code', this.language_code);
  
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
              const m = result['nuevoContenido'];
              this.multimediaIds.push(m?.id);
              this.multimedias.unshift(m);
              this.apiService.menuMustClose.next();
  
              this.translate.get('folder-content.Nuevo contenido subido correctamente')
                .subscribe(translatedText => {
                  this.utilities.showToast(translatedText);
                });
  
            } else if (result['state'] === 'NOTALLOWED') {
              this.apiService.menuMustClose.next();
              this.abrirModalInvitado();
            }
  
            processedCount++;
            if (processedCount === validFiles.length) {
             // this.utilities.dismissLoading();
              this.isChargeLoading=false;

              setTimeout(() => this.uploadProgressList = [], 1000); // Oculta las barras tras 1s
            }
  
          }, error => {
            console.log('❌ Error al cargar archivo:', error);
            processedCount++;
            if (processedCount === validFiles.length) {
              //this.utilities.dismissLoading();
              this.isChargeLoading=false;

              setTimeout(() => this.uploadProgressList = [], 1000);
            }
          });
        });
      }
    });
  
    fileInput.click(); // Abre el selector
  }
  
  
  public adjuntarMultimediaWebPerfe() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.png, .jpg, .jpeg, .mp4, .pdf'; // Solo se permiten estas extensiones
    fileInput.multiple = true;
  
    fileInput.addEventListener('change', (event) => {
      const files = (event.target as HTMLInputElement).files;
  
      if (files && files.length > 0) {
        const validExtensions = ['.png', '.jpg', '.jpeg', '.mp4', '.pdf', '.MOV', '.mov'];
        const filesArray = Array.from(files);
  
        const validFiles = filesArray.filter(file => {
          const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
          const isValid = validExtensions.includes(ext);
  
          if (!isValid) {
            const message = this.translate.instant("Tipo de archivo no permitido") + `: ${file.name}, ` + this.translate.instant("se excluirá del listado");
            this.utilities.showToast(message);
          }
  
          return isValid;
        });
  
        if (validFiles.length === 0) return;
  
       // this.utilities.showLoading('');
        this.isChargeLoading=true;

        let processedCount = 0;
  
        validFiles.forEach((selectedFile, index) => {
          const formData = new FormData();
          formData.append('multimediaFile', selectedFile);
          formData.append('project_id', this.projectId);
          formData.append('folder_id', this.folderId);
          formData.append('language_code', this.language_code);
  
          this.http.post(environment.apiUrl + 'multimediaWeb', formData, {headers: this.apiService.httpOptionsFiles.headers,
            reportProgress: true,
            observe: 'events'
          }).pipe(
            tap(event => {
              if (event.type === HttpEventType.UploadProgress) {
                const progress = Math.round((100 * event.loaded) / (event.total || 1));
                console.log(`📤 Progreso archivo ${index + 1}: ${progress}%`);
  
                // Guardar progreso en alguna propiedad si querés mostrarlo en la UI
                this.uploadProgress = progress;
              }
            }),
            filter(event => event.type === HttpEventType.Response),
            map((event: any) => event.body)
          ).subscribe(result => {
            if (result['state'] === 'UPLOADED') {
              const m = result['nuevoContenido'];
              this.multimediaIds.push(m?.id);
              this.multimedias.unshift(m);
  
              this.translate.get('folder-content.Nuevo contenido subido correctamente')
                .subscribe((translatedText: string) => {
                  this.utilities.showToast(translatedText);
                });
  
            } else if (result['state'] === 'NOTALLOWED') {
              this.abrirModalInvitado();
            }
  
            processedCount++;
            if (processedCount === validFiles.length) {
             // this.utilities.dismissLoading();
              this.isChargeLoading=false;

              this.uploadProgress = 0;
            }
  
          }, error => {
            console.log('Error al cargar archivos:', error);
            processedCount++;
            if (processedCount === validFiles.length) {
              //this.utilities.dismissLoading();
              this.isChargeLoading=false;

              this.uploadProgress = 0;
            }
          });
        });
      }
    });
  
    fileInput.click(); // Abre el selector
  }
  

  public adjuntarMultimediaWebSinProgreso() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.png, .jpg, .jpeg, .mp4, .pdf'; // Solo se permiten estas extensiones
    fileInput.multiple = true;
  
    fileInput.addEventListener('change', (event) => {
      const files = (event.target as HTMLInputElement).files;
  
      if (files && files.length > 0) {
        const validExtensions = ['.png', '.jpg', '.jpeg', '.mp4', '.pdf', '.MOV', '.mov'];
        const filesArray = Array.from(files);
  
        const validFiles = filesArray.filter(file => {
          const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
          const isValid = validExtensions.includes(ext);
  
          if (!isValid) {
            const message = this.translate.instant("Tipo de archivo no permitido") + `: ${file.name}, ` + this.translate.instant("se excluirá del listado");
            this.utilities.showToast(message);
          }
  
          return isValid;
        });
  
        if (validFiles.length === 0) return;
  
        //this.utilities.showLoading('');
        this.isChargeLoading=true;

  
        let processedCount = 0;
  
        validFiles.forEach((selectedFile) => {
          const formData = new FormData();
          formData.append('multimediaFile', selectedFile);
          formData.append('project_id', this.projectId);
          formData.append('folder_id', this.folderId);
          formData.append('language_code', this.language_code);
  
          this.apiService.multimediaWeb(formData).subscribe((result) => {
            if (result['state'] === 'UPLOADED') {
              const m = result['nuevoContenido'];
              this.multimediaIds.push(m?.id);
              this.multimedias.unshift(m);
             // this.openImageCropper(m);
  
              this.translate.get('folder-content.Nuevo contenido subido correctamente')
                .subscribe((translatedText: string) => {
                  this.utilities.showToast(translatedText);
                });
  
            } else if (result['state'] === 'NOTALLOWED') {
              this.abrirModalInvitado();
            }
  
            processedCount++;
            if (processedCount === validFiles.length) {
              //this.utilities.dismissLoading();
              this.isChargeLoading=false;

            }
  
          }, error => {
            console.log('Error al cargar archivos:', error);
            processedCount++;
            if (processedCount === validFiles.length) {
              //this.utilities.dismissLoading();
              this.isChargeLoading=false;

            }
          });
        });
      }
    });
  
    fileInput.click(); // Abre el selector
  }
  









  async openImageCropper(multimedia:any) {

    console.log(">>>>>>>>>>>>");

    let multimediaSelect=multimedia;
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
        multimediaSelect=result.data.croppedImageFile;
       console.log(">>>>>>>>>>");
        console.log(multimediaSelect);



        console.log(multimedia);
          const index = this.multimedias.findIndex(m => m.id === multimedia_id);
          if (index !== -1) {
            this.multimedias[index] = multimediaSelect;
          }

          


          console.log(multimedia);
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


  onIonInfinite(ev) {
    this.getMoreFolderData();
    console.log(ev);
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }




  getMoreFolderData() {
   
    console.log('>>>>>>>>>>>>more folders>>>>>>>>>>');



    this.apiService.obtainFolderData({folderId:this.folderId,multimediasIds:this.multimediaIds,language_code:this.language_code}).subscribe((result) => {
      console.log('Result',result);
      if(result['state'] && result['state']=='DATE_ENDED'){
        this.isDateEnded=true;
        this.utilities.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));

      }
      else{

        this.isDateEnded=false;
        this.multimedias=this.multimedias.concat(result['multimedias']);

        this.multimediaIds=this.multimediaIds.concat(result['multimediaIds']);
      }
      
     
      
    }, error => {
     
      this.translate.get('folder-content.No se pudo obtener las carpetas del proyecto').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
      //this.actu=true;
      
    });


      
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







ionViewWillLeave() {
  console.log("Se ejecuta ionViewWillLeave");
  //this.clearInterval();
}


ngOnDestroy() {
  //this.clearInterval();
  
  if (this.mediaActivatedSubscription) {
    this.mediaActivatedSubscription.unsubscribe();
    this.mediaActivatedSubscription = null;
  }

  if (this.folderChangeSubscription) {
    this.folderChangeSubscription.unsubscribe();
    this.folderChangeSubscription = null;
  }

  if (this.photoActivatedSubscription) {
    this.photoActivatedSubscription.unsubscribe();
    this.photoActivatedSubscription = null;
  }

}




// Inicia el intervalo para ejecutar la función cada 5 segundos
private startInterval() {
  this.countSeg=0;
  this.previousDate=new Date();
  if(this.interval==null){
 //   console.log("INTERVAL NULL CREANDO UNO NUEVO-----------------------------------");
    this.interval = setInterval(() => {
      this.checkDateDifference();
    }, 2000);
  }
  
}

// Limpia el intervalo cuando se sale de la pestaña
private clearInterval() {
  if (this.interval) {

    //ENVIO TIEMPO
    this.apiService.registerTimeScreen({screenId:36,screenTime:this.countSeg}).subscribe((result) => {
     // console.log('DATOS',result);
      
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
   // console.log(`folder-content: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
   // console.log(this.countSeg);

    //ENVIO TIEMPO
    this.apiService.registerTimeScreen({screenId:36,screenTime:this.countSeg}).subscribe((result) => {
    //  console.log('DATOS',result);
      
    }, error => {
      
      console.log(error);
    });

    //this.clearInterval();
    return;
  }

 

 
  if (this.isActive2) {
    const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
    this.countSeg=this.countSeg+differenceInSeconds;
  //  console.log(`folder-content: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
   // console.log(this.countSeg);


  } 
  else {
 //   console.log('folder-content: No hay fecha anterior, usando la actual como inicial.');
  }

  
  this.previousDate = currentDate;
}



  async abrirModalInvitado(){


    let titleText=this.translate.instant('folder-content.Máximo alcanzado');
    let infoText=this.translate.instant('folder-content.Hazte con el plan 360 para subir contenido de forma ilimitada');

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
       // this.navController.pop();
        this.navController.back();
       }

    
    });
    return await modal.present();
  }





  mostrarSeleccionBorrado() {
    this.seleccionando = !this.seleccionando; // Activa o desactiva la selección
    if (!this.seleccionando) {
      this.multimediaSeleccionados.clear(); // Si se desactiva, limpia la selección
      this.carpetasSeleccionadas.clear(); // Limpia carpetas seleccionadas también
    }
  }

  toggleSeleccionAnterior(multimediaId: number) {

    if(this.seleccionando==true){
      console.log("entro");

      if (this.multimediaSeleccionados.has(multimediaId)) {
        this.multimediaSeleccionados.delete(multimediaId); // Quita la selección
      } else {
        this.multimediaSeleccionados.add(multimediaId); // Agrega a la selección
      }
    }
  }



  toggleSeleccion(multimediaId: number) {
  if (!this.seleccionando) return;

  const multimedia = this.multimedias.find(item => item.id === multimediaId);
  if (!multimedia) return;

  if (multimedia.thetype === 'folder') {
    if (this.carpetasSeleccionadas.has(multimediaId)) {
      this.carpetasSeleccionadas.delete(multimediaId);
    } else {
      this.carpetasSeleccionadas.add(multimediaId);
    }
  } else {
    if (this.multimediaSeleccionados.has(multimediaId)) {
      this.multimediaSeleccionados.delete(multimediaId);
    } else {
      this.multimediaSeleccionados.add(multimediaId);
    }
  }
}


get totalSeleccionados(): number {
  return this.multimediaSeleccionados.size + this.carpetasSeleccionadas.size;
}



  async eliminarSeleccionados() {
    if (this.multimediaSeleccionados.size > 0|| this.carpetasSeleccionadas.size > 0) {


    let valtext=this.translate.instant('¿Está seguro de eliminar?');
    const alert = await this.alertCtrl.create({
      header: '',
      message: valtext,
      buttons: [
        {
          text: this.translate.instant('my-jobs.No'),
          role: 'cancel'
        },
        {
          text: this.translate.instant('my-jobs.Sí'),
          handler: () => {
        //-------------------------
//this.utilities.showLoading('');
      this.isChargeLoading=true;


      console.log(this.multimediaSeleccionados);
      const archivesIds = Array.from(this.multimediaSeleccionados);
      const foldersIds = Array.from(this.carpetasSeleccionadas);

      this.apiService.disableFolderArchives({projectId:this.projectId,archivesIds:archivesIds,foldersIds:foldersIds}).subscribe((result) => {

       // this.utilities.dismissLoading();
        this.isChargeLoading=false;


        if(result['status']=='DATE_ENDED'){
          this.utilities.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));
          this.isDateEnded=true;
        }
        else if(result['status']=='success'){
          this.isDateEnded=false;
         /* this.multimedias = this.multimedias.filter(
            item => !this.multimediaSeleccionados.has(item.id)
          );*/
           // 1️⃣ Eliminar archivos (NO folders) según archivesIds
          this.multimedias = this.multimedias.filter(item => {
            if (item.thetype !== 'folder') {
              return !archivesIds.includes(item.id);
            }
            return true; // no tocar folders aquí
          });

          // 2️⃣ Eliminar folders según foldersIds
          this.multimedias = this.multimedias.filter(item => {
            if (item.thetype === 'folder') {
              return !foldersIds.includes(item.id);
            }
            return true; // no tocar archivos aquí
          });
          this.multimediaSeleccionados.clear();
          this.carpetasSeleccionadas.clear();
          this.seleccionando = false; // Oculta el footer si ya no hay elementos seleccionados
    
          this.utilities.showToast(this.translate.instant("Archivos eliminados"));
        }
        
  
      }, async error => {
        const toastMensaje = await this.translate.get("No se pudieron borrar los archivos").toPromise();
        //this.utilities.dismissLoading();
        this.isChargeLoading=false;

        this.utilities.showToast(toastMensaje); 
       
        console.log(error);
      });



      
    
            
            
          
        
        //-------------------------
          }
        }
      ]
    });

    await alert.present();

  }









      
  }


  async abrirModalCarrusel(index: number) {
   // console.log("abrir modal grnade");
    this.isModalOpen2 = true;
    this.option.initialSlide = index;
    
  }


  cerrar($modal){
    
    //$modal.dismiss();
   // console.log('funcion cerrar');
    this.isModalOpen2 = false;
  }


  onSlideEnd() {
  //  console.log('You have reached the end of the carousel!');
    //this.getMoreJobs();
    this.getMoreFolderData();
  }

  goFolderPermissions(){
    this.navController.navigateForward("/participats-permissions-list", {state: {folderId:this.folderId}});
  }

  goNewFolderContent(){
    this.navController.navigateForward("/folder-content", {state: {folderId:this.folderId,projectId:this.projectId}});
  }





  async abrirModalEditFolder(){


    this.showOverlay=true;
    let titleText=this.translate.instant('folder-content.Máximo alcanzado');
    let infoText=this.translate.instant('folder-content.Hazte con el plan 360 para subir contenido de forma ilimitada');

    const modal = await this.modalCtrl.create({
      component: ModalEditFolderPage,
      cssClass: 'EditFolderModal',
      componentProps: {
      name:this.theFolder.name,
      folderId:this.folderId,
      showButton:true
        
        
      },initialBreakpoint: 0.33,     // Altura 1/3
           // Solo ese breakpoint
    handle: false,               // 🔒 No muestra el handle (línea de arrastre)
    handleBehavior: 'none',      // 🔒 Desactiva el arrastre
    backdropDismiss: true,      // No se cierra tocando fuera
    canDismiss: true,            // Se puede cerrar por código
    showBackdrop: false           // Activa fondo semitransparente 
});

    modal.onDidDismiss().then((data) => {
       this.showOverlay=false;
       console.log(data);
       let noBack = (data.data?.noBack); 
       console.log('HAY QUE VOLVER ATRAS',noBack);
       if(data.data?.state=='deleted'){
        this.goBack();
       }


       
       

       
    
      // let newName = (data.data?.newName); 
     // this.theFolder.name=newName;
      //this.folderName=newName;

    
    });
    return await modal.present();
  }



  async abrirModalMenuFolder(){


    this.showOverlay=true;
    let titleText=this.translate.instant('folder-content.Máximo alcanzado');
    let infoText=this.translate.instant('folder-content.Hazte con el plan 360 para subir contenido de forma ilimitada');

    const modal = await this.modalCtrl.create({
      component: ModalMenuFolderPage,
      cssClass: 'EditFolderModal',
      componentProps: {
      folderId:this.folderId,
      projectId:this.projectId,
        
        
      },initialBreakpoint: 0.33,     // Altura 1/3
           // Solo ese breakpoint
    handle: false,               // 🔒 No muestra el handle (línea de arrastre)
    handleBehavior: 'none',      // 🔒 Desactiva el arrastre
    backdropDismiss: false,      // No se cierra tocando fuera
    canDismiss: true,            // Se puede cerrar por código
    showBackdrop: false           // Activa fondo semitransparente 
});

    modal.onDidDismiss().then((data) => {
       this.showOverlay=false;
       console.log(data);
       let opcSelected = (data.data?.opcSelected); 
       console.log('OPCIÓN SELECCIONADA: ',opcSelected);
       


      /*if(){
        this.uploadMedia();
       }*/
       
       

       
    
      // let newName = (data.data?.newName); 
     // this.theFolder.name=newName;
      //this.folderName=newName;

    
    });
    return await modal.present();
  }

  


  startPress(folder: any) {
  this.pressTimer = setTimeout(() => {
    console.log('FOLDER ID:',folder);
    this.mostrarSeleccionBorrado();
  }, 1000); // 1 segundo
}

cancelPress() {
  clearTimeout(this.pressTimer);
}



  formatCreateDate(date: Date | string): string {
    return formatDate(date, 'dd/MM/yyyy', 'es-ES'); //
  }


  async abrirModalOpcionesCarpeta(){
      const modal = await this.modalCtrl.create({
        component: SelectFolderoptionsModalPage,
        cssClass: 'SelectModal',
        componentProps: {
         /* district: this.charge.mesaControl.district,*/
          
          
        },
       // backdropDismiss:false
      });
  
      modal.onDidDismiss().then((data) => {
       // const selectedNetwork = data.data?.selectedNetwork;
       const selectedOption = Number(data.data.selectedOption); 
       console.log('Opcion de usuario devuelta:', selectedOption);
        

        if(selectedOption==1){//Editar carpeta
          //this.bloquear();
        this.abrirModalEditFolder();
  
  
        }
        else if(selectedOption==2){//Modificar permisos de carpeta
         
          this.goFolderPermissions();
  
        }
        else{
  
          console.log("cancelada");
        }
  
      
      
  
  
  
      });
  
  
      return await modal.present();
    }
  



    public async adjuntarImageno() {

    //const permissions = await Camera.requestPermissions();


    /*if(permissions.photos === 'denied' || permissions.camera === 'denied') {
      console.log("permiso camera " , permissions);
      
    }*/

      
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

    this.form.patchValue({image : this.base64img});
    this.form.patchValue({folderId : this.folderId});
    this.form.patchValue({projectId : this.projectId});
    

    // Can be set to the src of an image now
    //imageElement.src = imageUrl;

    this.isChargeLoading=true;
    this.apiService.createFolderContentImage(this.form.value).subscribe((result) => {
      if (result['state'] === 'UPLOADED') {
        const m = result['nuevoContenido'];
        this.multimediaIds.push(m?.id);
        this.multimedias.unshift(m);
  
        this.translate.get('folder-content.Nuevo contenido subido correctamente')
        .subscribe(translatedText => {
          this.utilities.showToast(translatedText);
        });
  
      } else if (result['state'] === 'NOTALLOWED') {
        this.abrirModalInvitado();
      }

    }, (error) => {
      this.isChargeLoading=false;
      //this.utilities.dismissLoading();
      this.utilities.showToast(this.translate.instant(codeErrors(error)));
    });
  }



  public async adjuntarImagen() {

    


  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*'; // 🔹 Solo imágenes
  //fileInput.capture = 'environment'; // 🔹 Abrir cámara si el navegador lo soporta
  fileInput.multiple = true; // 🔹 varios un archivo

  fileInput.addEventListener('change', (event) => {
    const files = (event.target as HTMLInputElement).files;

    if (files && files.length > 0) {
      const validExtensions = ['.png', '.jpg', '.jpeg', '.heic', '.heif', '.webp'];
      const filesArray = Array.from(files);

      const validFiles = filesArray.filter(file => {
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        const isValid = validExtensions.includes(ext);
        if (!isValid) {
          const message = this.translate.instant("Tipo de archivo no permitido") + `: ${file.name}`;
          this.utilities.showToast(message);
        }
        return isValid;
      });

      if (validFiles.length === 0) return;

      this.isChargeLoading = true;
      this.uploadProgressList = [];
      let processedCount = 0;

      validFiles.forEach((selectedFile, index) => {
        const fileName = selectedFile.name;
        this.uploadProgressList.push({ name: fileName, progress: 0, completed: false });

        const formData = new FormData();
        formData.append('multimediaFile', selectedFile);
        formData.append('project_id', this.projectId);
        formData.append('folder_id', this.folderId);
        formData.append('language_code', this.language_code);

        this.http.post(environment.apiUrl + 'multimediaWeb', formData, {
          headers: this.apiService.httpOptionsFiles.headers,
          reportProgress: true,
          observe: 'events'
        }).pipe(
          tap(event => {
            if (event.type === HttpEventType.UploadProgress) {
              const progress = Math.round((100 * event.loaded) / (event.total || 1));
              this.uploadProgressList[index].progress = progress;
            }
          }),
          filter(event => event.type === HttpEventType.Response),
          map((event: any) => event.body)
        ).subscribe(result => {
          this.uploadProgressList[index].completed = true;

          if (result['state'] === 'UPLOADED') {
            const m = result['nuevoContenido'];
            this.multimediaIds.push(m?.id);
            this.multimedias.unshift(m);
            this.apiService.menuMustClose.next();

            this.translate.get('folder-content.Nuevo contenido subido correctamente')
              .subscribe(translatedText => {
                this.utilities.showToast(translatedText);
              });

          } else if (result['state'] === 'NOTALLOWED') {
            this.apiService.menuMustClose.next();
            this.abrirModalInvitado();
          }

          processedCount++;
          if (processedCount === validFiles.length) {
            this.isChargeLoading = false;
            setTimeout(() => this.uploadProgressList = [], 1000);
          }
        }, error => {
          console.error('❌ Error al cargar archivo:', error);
          processedCount++;
          if (processedCount === validFiles.length) {
            this.isChargeLoading = false;
            setTimeout(() => this.uploadProgressList = [], 1000);
          }
        });
      });
    }
  });

  fileInput.click(); // 🔹 Abrir selector
}




public async adjuntarImagen88() {
  try {
    const image = await Camera.getPhoto({
      source: CameraSource.Photos, // 🔹 Solo galería
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64
    });

    // Convertir Base64 a Blob
    const blob = this.base64ToBlob(image.base64String!, `image/${image.format}`);
    const fileName = `photo_${Date.now()}.${image.format}`;
    const file = new File([blob], fileName, { type: `image/${image.format}` });

    // Subida con barra de progreso
    this.isChargeLoading = true;
    this.uploadProgressList = []; // Reiniciar lista de progreso

    // Inicializar barra para esta imagen
    this.uploadProgressList.push({ name: fileName, progress: 0, completed: false });

    const formData = new FormData();
    formData.append('multimediaFile', file);
    formData.append('project_id', this.projectId);
    formData.append('folder_id', this.folderId);
    formData.append('language_code', this.language_code);

    this.http.post(environment.apiUrl + 'multimediaWeb', formData, {
      headers: this.apiService.httpOptionsFiles.headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      tap(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = Math.round((100 * event.loaded) / (event.total || 1));
          this.uploadProgressList[0].progress = progress;
          console.log(`📤 Subiendo ${fileName}: ${progress}%`);
        }
      }),
      filter(event => event.type === HttpEventType.Response),
      map((event: any) => event.body)
    ).subscribe({
      next: (result) => {
        this.uploadProgressList[0].completed = true;
        this.isChargeLoading = false;

        if (result['state'] === 'UPLOADED') {
          const m = result['nuevoContenido'];
          this.multimedias.unshift(m);
          this.utilities.showToast("Imagen subida correctamente");
        } else if (result['state'] === 'NOTALLOWED') {
          this.abrirModalInvitado();
        }

        // Ocultar barra después de un tiempo
        setTimeout(() => this.uploadProgressList = [], 1000);
      },
      error: (err) => {
        console.error('❌ Error al subir imagen:', err);
        this.isChargeLoading = false;
        setTimeout(() => this.uploadProgressList = [], 1000);
      }
    });

  } catch (error) {
    console.error('Operación cancelada o error:', error);
  }
}

// Helper para convertir Base64 a Blob
public base64ToBlob(base64Data: string, contentType = ''): Blob {
  const sliceSize = 512;
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
}


  public irAFolder(multimedia: any,$modal) {
    if (multimedia.thetype === 'folder') {
      // Cierra el modal del carrusel
      this.isModalOpen2 = false;
      $modal.dismiss();
   // console.log('funcion cerrar');
    this.isModalOpen2 = false;

      // Navega a la página "folder-content" con los mismos parámetros que usas en otros lugares
      this.navController.navigateForward("/folder-content", {
        state: {
          projectId: this.projectId,
          folderId: multimedia.id
        }
      });
    }
  }




  redirectToSocial(url: string) {
    // Verifica si la URL es válida y luego redirige al navegador
    if (url) {
      window.location.href = url;
    }
  }



  selectItem($multimedia){
   // abrirModalMultimedia1(multimedia.thevalue, multimedia.thetype, multimedia.id)
    if($multimedia.thetype=='imagen'){
      this.abrirModalMultimedia1($multimedia.thevalue, $multimedia.thetype, $multimedia.id)
    }
    else if($multimedia.thetype=='PDF'){
      this.abrirModalMultimedia($multimedia.thevalue, $multimedia.thetype, $multimedia.id,$multimedia)
    }
    else if($multimedia.thetype=='folder'){
      this.navController.navigateForward("/folder-content", {
      state: {
        projectId: this.projectId,
        folderId: $multimedia.id
      }
      });
    }
    else if($multimedia.thetype=='video'){
      this.abrirModalMultimedia($multimedia.thevalue, $multimedia.thetype, $multimedia.id,$multimedia)

    }
    else if($multimedia.thetype=='link'){
     this.redirectToSocial($multimedia.link_value);
    }

  }

}






