import { Component, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';

import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE

import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { NavController,Platform } from '@ionic/angular';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import pica from 'pica';
//import Cropper from 'cropperjs';
//import 'cropperjs/dist/cropper.min.css';
@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.page.html',
  styleUrls: ['./image-cropper.page.scss'],
})
export class ImageCropperPage implements AfterViewInit {
  @Input() imageRuta: string;
  @Input() multimedia_id: number;
  imageChangedEvent: any = '';
    croppedImage: any = '';
    croppedImageFile:any=null;
    imagenDeBase64:any='';

    public formData: FormData;

  constructor(private translate: TranslateService,private modalController: ModalController,private sanitizer: DomSanitizer,private apiService: ApiService,private platform: Platform, private utilities: UtilitiesService,private navCtrl: NavController) {

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
   

    if (this.imageRuta) {
      console.log(this.imageRuta);

      this.apiService.getMultimediaImageBase64({ruta:this.imageRuta}).subscribe((result) => {
        console.log('DATOS',result);
        this.imagenDeBase64=result.base64;
        
      }, error => {
        
        
        this.translate.get('No se pudo obtener el contenido multimedia').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        console.log(error);
      });

    }
   
    
  }

  /*loadImageFromUrl(url: string) {
    this.http.get(url, { responseType: 'blob' }).subscribe(blob => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageChangedEvent = {
          target: {
            files: [this.blobToFile(blob, 'image.jpg')]
          }
        };
      };
      reader.readAsDataURL(blob);
    });
  }*/

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    
}
imageCropped(event: ImageCroppedEvent) {
  this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);


  this.croppedImageFile=event.blob;

    console.log(this.croppedImageFile);
  // event.blob can be used to upload the cropped image

  //this.croppedImageb64 = this.sanitizer.bypassSecurityTrustUrl(event.base64);
 
  
        

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

async saveCroppedImage() {
  console.log("SATORU>>>>>>>>>>>>>>>>>>>>>>>>");
  console.log(this.croppedImageFile);
  this.utilities.showLoading('');

  try {
    // Convertir el archivo recortado a Base64
    const reader = new FileReader();
    reader.readAsDataURL(this.croppedImageFile);
    
    const base64Image = await new Promise<string>((resolve) => {
      reader.onload = () => resolve((reader.result as string).split(',')[1]); // Extraer solo el contenido base64
    });

    // 🔹 Redimensionar la imagen antes de enviarla
    const redimensionadaBase64 = await this.redimensionarImagen(base64Image, 600, 600);
    console.log('Imagen redimensionada Base64:', redimensionadaBase64);

    // 🔹 Convertir el Base64 redimensionado a un Blob para enviarlo
    const blobRedimensionado = await fetch(redimensionadaBase64).then(res => res.blob());

    // Crear FormData con la imagen redimensionada
    const formData = new FormData();
    formData.append('multimediaFile', blobRedimensionado);
    formData.append('multimedia_id', this.multimedia_id + "");
    formData.append('toedit', 'yes');

    // Llamada a la API
    this.apiService.multimediaWebEdit(formData).subscribe((result) => {
      console.log('DATOS', result);

      this.utilities.dismissLoading();

      this.modalController.dismiss({
        croppedImageFile: result,
      });

      this.translate.get('Nuevo contenido subido correctamente').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });

    }, error => {
      console.log('Error al cargar archivos:', error);
      this.utilities.dismissLoading();
    });

  } catch (error) {
    console.error('Error al redimensionar o subir la imagen:', error);
    this.utilities.dismissLoading();
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

  return canvas.toDataURL('image/jpeg', 0.8);
}

  


dismiss() {
  this.modalController.dismiss({
   // croppedImage: this.croppedImage,
    croppedImageFile: this.croppedImageFile,
  });
}

dismiss2() {
  this.modalController.dismiss({
   // croppedImage: this.croppedImage,
    //croppedImageFile: this.croppedImageFile,
  });
}
  



uploadOriginalImage() {
  console.log("Subiendo la imagen original...");

  if (!this.imagenDeBase64) {
    console.error("No hay imagen seleccionada.");
    return;
  }

  this.utilities.showLoading('');

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

        this.utilities.dismissLoading();
        this.modalController.dismiss({
          uploadedImage: result.base64 ? `data:image/jpeg;base64,${result.base64}` : null,
        });

        this.utilities.showToast(this.translate.instant('Imagen subida correctamente'));
      }, error => {
        console.error('Error al subir la imagen:', error);
        this.utilities.dismissLoading();
      });
    });
}


































  /*

  saveCroppedImage() {
  // Aquí puedes enviar la imagen recortada al servidor o hacer lo que necesites con ella
  // Por ejemplo, puedes usar HttpClient para enviarla a un servidor
console.log("SATORU>>>>>>>>>>>>>>>>>>>>>>>>");
  //console.log(this.croppedImage);
  console.log(this.croppedImageFile);
  this.utilities.showLoading('');
  const formData = new FormData();
  formData.append('multimediaFile', this.croppedImageFile);
  formData.append('multimedia_id', this.multimedia_id+"");
  formData.append('toedit', 'yes');

   // Realizar la llamada a la API para subir cada archivo
   this.apiService.multimediaWebEdit(formData).subscribe((result) => {
    console.log('DATOS', result);

    // Manejo de la respuesta y actualización de la interfaz de usuario
    this.utilities.dismissLoading();

    this.modalController.dismiss({
      // croppedImage: this.croppedImage,
       croppedImageFile: result,
     });
    

    // Mostrar mensaje de éxito
    this.translate.get('Nuevo contenido subido correctamente').subscribe((translatedText: string) => {
      this.utilities.showToast(translatedText); 
    });
  }, error => {
    console.log('Error al cargar archivos:', error);
    this.utilities.dismissLoading();
    // Manejar el error adecuadamente
  });

  

  
}













uploadOriginalImage() {
  console.log("Subiendo la imagen original...");

  if (!this.imagenDeBase64) {
    console.error("No hay imagen seleccionada.");
    return;
  }

  this.utilities.showLoading('');

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

        this.utilities.dismissLoading();
        this.modalController.dismiss({
          uploadedImage: result.base64 ? `data:image/jpeg;base64,${result.base64}` : null,
        });

        this.utilities.showToast(this.translate.instant('Imagen subida correctamente'));
      }, error => {
        console.error('Error al subir la imagen:', error);
        this.utilities.dismissLoading();
      });
    });
}

  */

}
