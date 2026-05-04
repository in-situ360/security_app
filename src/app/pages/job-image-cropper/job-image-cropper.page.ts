import { Component, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE


import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { NavController,Platform } from '@ionic/angular';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

import pica from 'pica';

@Component({
  selector: 'app-job-image-cropper',
  templateUrl: './job-image-cropper.page.html',
  styleUrls: ['./job-image-cropper.page.scss'],
})
export class JobImageCropperPage implements AfterViewInit {
  public personalArchiveId:any=null;

  @Input() imageRuta: string;
  @Input() newImage: boolean | undefined = false;
    
    imageChangedEvent: any = '';
      croppedImage: any = '';
      croppedImageFile:any=null;
      imagenDeBase64:any='';
      croppedImageBase64Value:any=null;
  
      public formData: FormData;
      isChargeLoading:boolean=false;
  
    constructor(private navParams: NavParams,private translate: TranslateService,private modalController: ModalController,private sanitizer: DomSanitizer,private apiService: ApiService,private platform: Platform, private utilities: UtilitiesService,private navCtrl: NavController) {
  
      this.formData = new FormData();
      this.imageChangedEvent = 'assets/imgs/cars/sliderCar.png';
    }
  
    ngAfterViewInit() {
  
      console.log(this.translate.langs.length);
      
        if (this.translate.langs.length == 0) {
          console.log("No idioma");
      
          this.utilities.saveLang('en');
        }
      
    }
  
    ngOnInit() {
      this.personalArchiveId=this.navParams.get('personalArchiveId');
      console.log('this.personalArchiveId',this.personalArchiveId);
      if(this.personalArchiveId){
        this.apiService.obtainPersonalArchiveImage({multimediaId:this.personalArchiveId}).subscribe((result:any) => {
              console.log(result.base64);
              this.imagenDeBase64=result.base64;
             
        
            }, async error => {
              console.log(error);
            });

      }

      
     
  
      if (this.imageRuta) {
        console.log("img(ngOnInit)");
        console.log(this.imageRuta);
  
        this.imagenDeBase64=this.imageRuta;
  
       
  
      }
     
      
    }
  
    
  
    fileChangeEvent(event: any): void {
      this.imageChangedEvent = event;
      
  }
  imageCropped(event: ImageCroppedEvent) {
  
    console.log("imageCropped>>>>>>>>>>>>>>>>>>>>>>");
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
  
  
    this.croppedImageFile=event.blob;
  
      console.log(this.croppedImageFile);
  
  
    
          
  
  }
  
  
  
  
  
  
  
  imageLoaded(image: LoadedImage) {
      // show cropper
  }
  cropperReady() {
      // cropper ready
  }
  loadImageFailed() {
      // show message
  }
  
  saveCroppedImage2() {
    // Aquí puedes enviar la imagen recortada al servidor o hacer lo que necesites con ella
    // Por ejemplo, puedes usar HttpClient para enviarla a un servidor
  
    
    //console.log(this.croppedImage);
    console.log("saveCroppedImage");
    console.log(this.croppedImageFile);
    this.isChargeLoading=true;
    //this.utilities.showLoading('');
    const formData = new FormData();
    formData.append('multimediaFile', this.croppedImageFile);
    formData.append('multimedia_id', -1+"");
    formData.append('toedit', 'yes');
  
     // Realizar la llamada a la API para subir cada archivo
     this.apiService.multimediaCroppedEdit(formData).subscribe((result) => {
      console.log('DATOS', result);
  
      console.log("a1");
      const base64Image = result.base64;
  
      console.log("a2");
      // Guarda el base64 en una variable
     this.croppedImageBase64Value = 'data:image/jpeg;base64,' +base64Image;
  
     console.log("a3");
      // Manejo de la respuesta y actualización de la interfaz de usuario
      //this.utilities.dismissLoading();
      this.isChargeLoading=false;
  
      console.log("a4");
      this.modalController.dismiss({
        // croppedImage: this.croppedImage,
        croppedImageFile: this.croppedImageBase64Value,
       });
      
  
      // Mostrar mensaje de éxito
      
      this.translate.get('Nuevo contenido subido correctamente').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
    }, error => {
      console.log('Error al cargar archivos:', error);
      //this.utilities.dismissLoading();
      this.isChargeLoading=false;
      // Manejar el error adecuadamente
    });
  
    
  
    
  }
    
  
  
  /*dismiss() {
    this.modalController.dismiss({
     // croppedImage: this.croppedImage,
      croppedImageFile: this.croppedImageFile,
    });
  }*/
  
  dismiss2() {
    this.modalController.dismiss({
     // croppedImage: this.croppedImage,
      //croppedImageFile: this.croppedImageFile,
    });
  }
  
  
  
  
  
  
  
  async saveCroppedImage() {
    console.log("saveCroppedImage");
    console.log(this.croppedImageFile);
  
    //this.utilities.showLoading('');
    this.isChargeLoading=true;
  
    try {
      // Convertir el archivo recortado a base64
      const reader = new FileReader();
      reader.readAsDataURL(this.croppedImageFile);
      await new Promise<void>((resolve) => {
        reader.onload = () => {
          this.imagenDeBase64 = (reader.result as string).split(',')[1]; // Extraer solo el contenido base64
          resolve();
        };
      });
  
      // Redimensionar la imagen
      const redimensionadaBase64 = await this.redimensionarImagen(this.imagenDeBase64, 600, 600);
      console.log('Imagen redimensionada Base64:', redimensionadaBase64);
  
      // Convertir el Base64 redimensionado a un Blob para enviarlo
      const blobRedimensionado = await fetch(redimensionadaBase64).then((res) => res.blob());
  
      // Preparar el FormData para la API
      const formData = new FormData();
      formData.append('multimediaFile', blobRedimensionado); // Enviar el Blob redimensionado
      formData.append('personalDataId', this.personalArchiveId);
      formData.append('toedit', 'yes');
  
      // Realizar la llamada a la API para subir el archivo
      const result = await this.apiService.multimediaCroppedEditPD(formData).toPromise();
  
      console.log('DATOS', result);
      this.apiService.personalArchiveChanges.next(result.pa);
  
      // Guardar el base64 devuelto en una variable
      //const base64Image = result.base64;
      //this.croppedImageBase64Value = 'data:image/jpeg;base64,' + base64Image;
  
      //console.log('Base64 Final:', this.croppedImageBase64Value);
  
      // Ocultar el cargador y cerrar el modal
      //this.utilities.dismissLoading();
      this.isChargeLoading=false;
      this.modalController.dismiss({
        isCroppedImage: true,
        base64Data:result.base64Data,
        newMediaArchive:result.pa.thevalue,

      });
  
      // Mostrar mensaje de éxito
      const successMessage = await this.translate
        .get('Nuevo contenido subido correctamente')
        .toPromise();
      this.utilities.showToast(successMessage);
    } catch (error) {
      console.error('Error al redimensionar o cargar archivos:', error);
  
      // Manejar el error adecuadamente
     // this.utilities.dismissLoading();
      this.isChargeLoading=false;
      this.utilities.showToast(
        await this.translate.get('Error al subir la imagen').toPromise()
      );
    }
  }
  
    
  
  
  
  
  
  
    async redimensionarImagen(base64: string, width: number, height: number): Promise<string> {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${base64}`;
  
      await new Promise((resolve) => (img.onload = resolve));
  
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
  
      const picaInstance = pica();
      await picaInstance.resize(img, canvas);
  
      return canvas.toDataURL('image/jpeg', 0.8); // Devuelve una imagen comprimida
    }
  
  
  
  
  
  
  
  
    uploadOriginalImage() {
      console.log("Subiendo la imagen original...");
    
      if (!this.imagenDeBase64) {
        console.error("No hay imagen seleccionada.");
        return;
      }
    
     // this.utilities.showLoading('');
      this.isChargeLoading=true;
    
      // Convertir base64 a Blob
      fetch(this.imagenDeBase64)
        .then(res => res.blob())
        .then(blob => {
          const formData = new FormData();
          formData.append('multimediaFile', blob);
          formData.append('multimedia_id', '-1');
          formData.append('toedit', 'no'); // Indicar que no se ha editado
    
          this.apiService.multimediaCroppedEdit(formData).subscribe((result) => {
            console.log('Imagen subida correctamente:', result);
    
           // this.utilities.dismissLoading();
            this.isChargeLoading=false;
            this.modalController.dismiss({
              uploadedImage: result.base64 ? `data:image/jpeg;base64,${result.base64}` : null,
            });
    
            this.utilities.showToast(this.translate.instant('Imagen subida correctamente'));
          }, error => {
            console.error('Error al subir la imagen:', error);
           // this.utilities.dismissLoading();
            this.isChargeLoading=false;
          });
        });
    }
    
    
  
  }
  