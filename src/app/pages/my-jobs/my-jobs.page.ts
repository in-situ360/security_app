import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, NavController, Platform } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';


import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE

import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { User } from 'src/app/models/User';


import { AuthenticationService } from 'src/app/services/authentication.service';

import { codeErrors } from 'src/app/utils/utils';
import { Camera, CameraResultType } from '@capacitor/camera';
import { AllImageCropperPage } from '../all-image-cropper/all-image-cropper.page';
import { ModalMultimediaPage } from '../modal-multimedia/modal-multimedia.page';




import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';


import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, tap, filter, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SelectMenuEditMediaPage } from '../select-menu-edit-media/select-menu-edit-media.page';


@Component({
  selector: 'app-my-jobs',
  templateUrl: './my-jobs.page.html',
  styleUrls: ['./my-jobs.page.scss'],
})
export class MyJobsPage implements OnInit {


  isAndroid: boolean = false;
  isIOS: boolean = false;

  personalDataTask: number = 0;
  jobTask: number = 0;
  laguajeTask: number = 0;
  locationTask: number = 0;
  socialNetTask: number = 0;


  public jobs: any = [];
  public jobsIds: any = [];
  public multimedias: any = [];
  public multimediaIds: any = [];
  private language_code: string = 'en';
  public form: FormGroup;
  public base64img: string;

  //SEGUIMIENTO DE TIEMPO
  private interval: any = null;;
  private countSeg: number;
  private previousDate: Date | null = null;
  private isActive2: boolean = true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  option = {
    slidesPerView: 1.5,
    centeredSlides: true,
    loop: false,//true
    spaceBetween: 10,
    //autoplay:true,
    initialSlide: 0,
  }

  public isModalOpen2: any = false;

  isChargeLoading: boolean = false;

  public uploadProgress: any = 0;
  uploadProgressList: { name: string; progress: number; completed: boolean }[] = [];

  public seleccionando: boolean = false; // Controla si se está en modo selección
  public multimediaSeleccionados: Set<number> = new Set(); // Guarda los IDs seleccionados
  public deleteJobChangeSubscription: Subscription | null = null;


  constructor(
    private http: HttpClient,
    private platform: Platform,
    private modalCtrl: ModalController,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private navCtrl: NavController,
    private alertController: AlertController,
    private translate: TranslateService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
  ) {

    this.isIOS = this.platform.is('ios');
    this.isAndroid = this.platform.is('android');

  }

  ngOnInit() {
    //this.obtainUserJobList();

    this.form = new FormGroup({

      avatar: new FormControl('')
    });

    this.apiService.personalArchiveChanges.subscribe((pa) => {
      const index = this.multimedias.findIndex(item => item.id === pa.id);
      if (index !== -1) {
        this.multimedias[index] = pa;
        console.log('Archivo personal actualizado en el array multimedias:', pa);
      }
    });

    if (!this.deleteJobChangeSubscription) {
      this.deleteJobChangeSubscription = this.apiService.deleteJobChange.subscribe((id) => {
        //const index = this.multimedias.findIndex(item => item.id === id);
        this.multimedias = this.multimedias.filter(multimedia => multimedia.id !== id);


      });
    }

  }

  ionViewDidEnter() {
    console.log(this.translate.langs.length);

    /*if (this.translate.langs.length == 0) {
      console.log("No idioma");
  
      this.utilities.saveLang('en');
    }*/

    this.utilities.getLang().then((result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo == null) {
        console.log("No idioma");
        this.utilities.saveLang('en');


      } else {

        this.switchLanguage(prefijo || 'en');

      }
      this.obtainPersonalArchives();
    });

  }

  goBack() {
    this.navCtrl.pop()
  }




  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.language_code = language;

  }



  public async adjuntarImagen() {

    const permissions = await Camera.requestPermissions();


    if (permissions.photos === 'denied' || permissions.camera === 'denied') {
      console.log("permiso camera ", permissions);

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

    console.log("imagen ", this.base64img);

    this.form.patchValue({ avatar: this.base64img })
    this.mostrarAlertaSubida();

    // Can be set to the src of an image now
    //imageElement.src = imageUrl;
  }



  public obtainUserJobList() {
    this.jobs = [];
    this.jobsIds = [];
    this.apiService.obtainUserJobList({ jobsIds: this.jobsIds }).subscribe((result) => {
      console.log('DATOS', result);
      this.jobs = this.jobs.concat(result['jobs']);

      //------------
      // Filtrar las imágenes de multimedia
      /*this.jobs.forEach(vehicle => {
        if (vehicle.multimedia) {
          vehicle.multimedia = vehicle.multimedia.filter(media => media.thetype === 'imagen');
        }
      });*/
      //------------

      this.jobsIds = this.jobsIds.concat(result['jobsIds']);//añado nuevos ids


    }, async error => {
      const toastMensaje = await this.translate.get("my-jobs.No se pudo obtener los trabajos").toPromise();
      this.utilities.showToast(toastMensaje);

      console.log(error);
    });
  }


  onIonInfiniteJobs(ev) {


    console.log('-----------llego al final---------------');

    // this.getMoreJobs();
    this.getMorePersonalArchives();


    console.log(ev);
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }




  getMoreJobs() {

    console.log('>>>>>>>>>>>>getMoreFavorites>>>>>>>>>>');
    this.apiService.obtainUserJobList({ jobsIds: this.jobsIds }).subscribe((result) => {
      console.log('Result2', result);

      this.jobs = this.jobs.concat(result['jobs']);//concadenar listado vehiculos

      //------------
      // Filtrar las imágenes de multimedia
      /*this.jobs.forEach(vehicle => {
        if (vehicle.multimedia) {
          vehicle.multimedia = vehicle.multimedia.filter(media => media.thetype === 'imagen');
        }
      });*/
      //------------

      this.jobsIds = this.jobsIds.concat(result['jobsIds']);//añado nuevos ids



      //this.actu=true;
    }, async error => {

      const toastMensaje = await this.translate.get("my-jobs.No se pudo obtener los trabajos").toPromise();
      this.utilities.showToast(toastMensaje);
      console.log(error);
      //this.actu=true;

    });
  }






  async mostrarAlertaBorrado($id) {

    const toastMensaje = await this.translate.get("my-jobs.¿Desea eliminar la imagen?").toPromise();
    const toastMensaje2 = await this.translate.get("my-jobs.No").toPromise();
    const toastMensaje3 = await this.translate.get("my-jobs.Sí").toPromise();

    const alert = await this.alertController.create({
      //header:'Acceso denegado',
      message: toastMensaje,
      cssClass: 'custom-button-class',
      buttons: [
        {
          text: toastMensaje2,
          role: 'cancel',
          cssClass: 'custom-button-class',
          handler: () => {
            console.log('Clic en Cancelar');
          }
        },
        {
          text: toastMensaje3,
          cssClass: 'custom-button-class',
          handler: () => {
            console.log('Clic en Aceptar');
            console.log("JOB ID: ", $id);



            this.apiService.deletePersonalArchive({ multimediaId: $id }).subscribe((result) => {
              this.multimedias = this.multimedias.filter(multimedia => multimedia.id !== $id);

              // document.getElementById($id).classList.toggle('customItem');

              this.apiService.userChanges2.next();

            }, async error => {
              const toastMensaje = await this.translate.get("my-jobs.Hubo un problema al borrar").toPromise();

              // this.utilities.showToast('Hubo un problema al borrar');
              this.utilities.showToast(toastMensaje);

              console.log(error);
            });

          },
          //cssClass: 'custom-button-class' 
        }
      ],
      backdropDismiss: false
    });

    await alert.present();
  }



  async mostrarAlertaSubida() {


    const toastMensaje = await this.translate.get("my-jobs.¿Desea ajustar la imagen antes de que sea subida?").toPromise();
    const toastMensaje2 = await this.translate.get("my-jobs.Subir imagen").toPromise();
    const toastMensaje3 = await this.translate.get("my-jobs.Ajustar imagen").toPromise();
    const toastMensaje4 = await this.translate.get("my-jobs.Cancelar Subida").toPromise();

    const alert = await this.alertController.create({
      //header:'Acceso denegado',
      message: toastMensaje,
      cssClass: 'custom-button-class',
      buttons: [


        {
          text: toastMensaje2,
          cssClass: 'custom-button-class',
          handler: () => {
            console.log('Clic en Aceptar');


            this.apiService.createJob(this.form.value).subscribe((result) => {


              this.jobs.push(result);

              // Añadir el id del nuevo job al array de jobsIds
              // this.jobsIds=this.jobsIds.push(result.id);
              console.log(this.jobsIds);
              this.jobsIds = this.jobsIds.concat(result.id);
              console.log(this.jobsIds);
              this.apiService.userChanges2.next();

            }, async error => {
              //this.utilities.showToast('No se pudo crear el trabajo');

              this.utilities.showToast(await this.translate.get("my-jobs.No se pudo crear el trabajo").toPromise());

              console.log(error);
            });

          },
          //cssClass: 'custom-button-class' 
        },
        {
          text: toastMensaje3,
          cssClass: 'custom-button-class',
          handler: () => {
            console.log('Clic en ajustar');
            this.openAllImageCropper();
          }
        },
        {
          text: toastMensaje4,
          role: 'cancel',
          cssClass: 'custom-button-class',
          handler: () => {
            console.log('Clic en Cancelar');
          }
        }
      ],
      backdropDismiss: false
    });

    await alert.present();
  }


  controlCompletedTask() {





  }




  async openAllImageCropper() {

    console.log(">>>>>>>>>>>>");


    const imageRuta = this.base64img;



    //if(this.isImageFile(imageRuta)){

    console.log(">>>>>>>>>>>>2");
    const modal = await this.modalCtrl.create({
      component: AllImageCropperPage,
      componentProps: { imageRuta }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        console.log('Cropped Image:', result.data);

        if (result.data.croppedImageFile != null) {
          this.base64img = result.data.croppedImageFile;


          console.log("dios que funcione>>>>>>>>>>>>");

          console.log(this.base64img);
          //this.rutaImagen =this.base64img;

          this.form.patchValue({ avatar: this.base64img });


          this.apiService.createJob(this.form.value).subscribe((result) => {


            this.jobs.push(result);

            // Añadir el id del nuevo job al array de jobsIds
            // this.jobsIds=this.jobsIds.push(result.id);
            console.log(this.jobsIds);
            this.jobsIds = this.jobsIds.concat(result.id);
            console.log(this.jobsIds);
            this.apiService.userChanges2.next();

          }, async error => {
            this.utilities.showToast(await this.translate.get("my-jobs.No se pudo crear el trabajo").toPromise());


            console.log(error);
          });


          //this.user.avatar = this.base64img;
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



















  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2 = state.isActive;
      if (this.isActive2) {
        console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
        const currentRoute = this.router.url;
        if (currentRoute.includes('/my-jobs')) {
          console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
          // this.startInterval();
        }
      }
      else {
        // this.clearInterval();

      }

    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Verifica si la ruta actual no es '/UserSearch'
        if (!event.url.includes('/my-jobs')) {
       //   console.log('Saliendo de my-jobs, limpiando intervalos');
          // this.clearInterval();
        }
        else {
          // this.startInterval();
        }
      }
    });



    if (this.interval == null) {
      // this.startInterval();
    }


  }


  ionViewWillLeave() {
    console.log("Se ejecuta ionViewWillLeave");
    // this.clearInterval();
  }


  ngOnDestroy() {
    // this.clearInterval();


    if (this.deleteJobChangeSubscription) {
      this.deleteJobChangeSubscription.unsubscribe();
      this.deleteJobChangeSubscription = null;
    }

  }




  // Inicia el intervalo para ejecutar la función cada 5 segundos
  private startInterval() {
    this.countSeg = 0;
    this.previousDate = new Date();
    if (this.interval == null) {
      console.log("INTERVAL NULL CREANDO UNO NUEVO-----------------------------------");
      this.interval = setInterval(() => {
        this.checkDateDifference();
      }, 2000);
    }

  }

  // Limpia el intervalo cuando se sale de la pestaña
  private clearInterval() {

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
      console.log("Suscripción al router cancelada correctamente");
    }

    if (this.interval) {

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({ screenId: 17, screenTime: this.countSeg }).subscribe((result) => {
        console.log('DATOS', result);

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


    if (!this.isActive2) {

      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg = this.countSeg + differenceInSeconds;
      console.log(`my-jobs: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({ screenId: 17, screenTime: this.countSeg }).subscribe((result) => {
        console.log('DATOS', result);

      }, error => {

        console.log(error);
      });

      // this.clearInterval();
      return;
    }




    if (this.isActive2) {
      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg = this.countSeg + differenceInSeconds;
      console.log(`my-jobs: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    }
    else {
      console.log('my-jobs: No hay fecha anterior, usando la actual como inicial.');
    }


    this.previousDate = currentDate;
  }



  async abrirModalCarrusel(index: number) {
    console.log("abrir modal grnade");
    this.isModalOpen2 = true;
    this.option.initialSlide = index;

  }

  async abrirModal(multimedia: any) {

    if (multimedia.thetype === 'imagen') {
      this.abrirModalMultimedia1(multimedia.thevalue, multimedia.thetype, multimedia.id);
    }
    else if (multimedia.thetype === 'PDF') {
      this.abrirModalMultimedia(multimedia.thevalue, multimedia.thetype, multimedia.id, multimedia);
    }
    else if (multimedia.thetype === 'video') {
      this.abrirModalMultimedia1(multimedia.thevalue, multimedia.thetype, multimedia.id);
    }
    /*<video *ngIf="multimedia.thetype==='video'" id="videoTrailer" width="100%" height="100%" controls controlsList="nodownload">
               <source [src]="multimedia?.thevalue">Your browser does not support the video tag.
             </video>*/
  }


  cerrar($modal) {

    //$modal.dismiss();
    console.log('funcion cerrar');
    this.isModalOpen2 = false;
  }


  onSlideEnd() {
    console.log('You have reached the end of the carousel!');
    // this.getMoreJobs();
    this.getMorePersonalArchives();
  }









  //-----------------------------

  obtainPersonalArchives() {
    //obtainFolderData
    this.apiService.obtainPersonalArchives({ multimediasIds: this.multimediaIds, language_code: this.language_code }).subscribe((result) => {
      console.log('Result', result);
      this.multimedias = this.multimedias.concat(result['multimedias']);//concadenar listado 
      this.multimediaIds = this.multimediaIds.concat(result['multimediaIds']);//añado nuevos ids
    }, error => {
      console.log(error);
    });
  }




  getMorePersonalArchives() {
    this.apiService.obtainPersonalArchives({ multimediasIds: this.multimediaIds, language_code: this.language_code }).subscribe((result) => {
      console.log('Result2', result);
      this.multimedias = this.multimedias.concat(result['multimedias']);//concadenar listado 
      this.multimediaIds = this.multimediaIds.concat(result['multimediaIds']);//añado nuevos ids
    }, async error => {
      const toastMensaje = await this.translate.get("my-jobs.No se pudo obtener los trabajos").toPromise();
      this.utilities.showToast(toastMensaje);
      console.log(error);
    });
  }

  async abrirModalMultimedia($media, $type, $id, $multimedia) {

    //if(this.seleccionando!=true){

    let name = this.extractOriginalName($multimedia);

    const modal = await this.modalCtrl.create({
      component: ModalMultimediaPage,
      cssClass: 'MultimediaModal',
      componentProps: {
        mediaArchive: $media,
        mediaType: $type,
        id: $id,
        pdfName: name,
        fromJobs: true,
        canEdit: true,
      },
      // backdropDismiss:false
    });
    return await modal.present();
    //}
  }



  async abrirModalMultimedia1($media, $type, $id) {

    //if(this.seleccionando!=true){

    const modal = await this.modalCtrl.create({
      component: ModalMultimediaPage,
      cssClass: 'MultimediaModal',
      componentProps: {
        mediaArchive: $media,
        mediaType: $type,
        id: $id,
        pdfName: '',
        canEdit: true,
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


  public async uploadMedia() {
    this.adjuntarMultimediaWeb();
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
            this.utilities.showToast(`Tipo de archivo no permitido: ${file.name}, se excluirá del listado`);
          }
          return isValid;
        });

        if (validFiles.length === 0) return;

        // this.utilities.showLoading('');
        this.isChargeLoading = true;

        this.uploadProgressList = []; // reset progress

        let processedCount = 0;

        validFiles.forEach((selectedFile, index) => {
          const fileName = selectedFile.name;

          // Inicializar barra individual
          this.uploadProgressList.push({ name: fileName, progress: 0, completed: false });

          const formData = new FormData();
          formData.append('multimediaFile', selectedFile);
          formData.append('language_code', this.language_code);

          this.http.post(environment.apiUrl + 'multimediaWebPersonalArchive', formData, {
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
              this.apiService.personalArchiveNew.next(m);

              this.translate.get('folder-content.Nuevo contenido subido correctamente')
                .subscribe(translatedText => {
                  this.utilities.showToast(translatedText);
                });

            } else if (result['state'] === 'NOTALLOWED') {
              console.log('NOTALLOWED');
            }

            processedCount++;
            if (processedCount === validFiles.length) {
              // this.utilities.dismissLoading();
              this.isChargeLoading = false;

              setTimeout(() => this.uploadProgressList = [], 1000); // Oculta las barras tras 1s
            }

          }, error => {
            console.log('❌ Error al cargar archivo:', error);
            processedCount++;
            if (processedCount === validFiles.length) {
              //this.utilities.dismissLoading();
              this.isChargeLoading = false;

              setTimeout(() => this.uploadProgressList = [], 1000);
            }
          });
        });
      }
    });

    fileInput.click(); // Abre el selector
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
