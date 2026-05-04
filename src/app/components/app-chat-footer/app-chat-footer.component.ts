import { Component, NgZone, EventEmitter, Input, OnInit, Output,ViewChild } from '@angular/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Mensaje } from 'src/app/models/Mensaje';
import { ElementRef } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE
import { Keyboard } from '@capacitor/keyboard';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { GlobalWorkerOptions, getDocument, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { ApiService } from 'src/app/services/api.service';

import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';


import { VoiceRecorder, RecordingData, GenericResponse } from 'capacitor-voice-recorder';
import { Observable, tap, filter, map } from 'rxjs';



@Component({
  selector: 'app-chat-footer',
  templateUrl: './app-chat-footer.component.html',
  styleUrls: ['./app-chat-footer.component.scss'],
})
export class AppChatFooterComponent implements OnInit {

  placeholder2: string;
  audioFinishedMessage: string="audioFinishedMessage";
  tapToSendMessage: string="tapToSendMessage";

  audioUrl: string = 'http://in-situ360.com/devxerintel//storage/user-post-chats/0906202412244366dad86bdf3cf.mp3';

  public message: Mensaje;
  @Input() placeholder: string;
  @Output() sendText = new EventEmitter<Mensaje>();

  @ViewChild('fileInput') fileInput: ElementRef;

  isAndroid: boolean = false;
  isIOS: boolean = false;
  pdfImagen:any=null;
  pageImage: string;
  public pdfData:any=[];


  public selectedFile:any=null;

  entroEnComprobar=false;
  ocultarAudio=true;
  mostrarAudio=false;
  tienePermiso = false;
  grabando = false;
  pausado = false;
  audioBase64: string | null = null;
  blobAudio: Blob | null = null;
  temporizador: any;
  tiempoTranscurrido = 0;
  displayTemporizador = '00:00.00';
  isDisabled: boolean = false;

  constructor(private api:ApiService,private http: HttpClient,private ngZone: NgZone,private platform: Platform,private utilities: UtilitiesService,private translate: TranslateService) { 
    GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  }

  ngOnInit() {
    this.initMessage();



    this.solicitarPermisos();//audio
    this.loadTranslations();
    
  }

  ionViewDidEnter() {
    console.log(this.translate.langs.length);
  
    if (this.translate.langs.length == 0) {
      console.log("No idioma");
  
      this.utilities.saveLang('en');
      
    }


    
  }

  loadTranslations() {
    
    this.translate.get('app-chat-footer.Escribe aquí...').subscribe((res: string) => {
      this.placeholder2 = res; // O cualquier variable que necesites usar en el template
    });
    this.translate.get('app-chat-footer.Grabación finalizada').subscribe((res: string) => {
      this.audioFinishedMessage = res; // Asignación a variable
    });
    this.translate.get('app-chat-footer.Pulse aquí para enviar').subscribe((res: string) => {
      this.tapToSendMessage = res; // Asignación a variable
    });
    // Repite para otros textos que necesites traducir
  }





  public async addImage() {

    // Verificar si hay audio en curso
    if(this.mostrarAudio){
      this.translate.get('app-chat-footer.Se está realizando una grabación de audio').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
      return;
    }
    else if(this.audioBase64!=null){
      this.translate.get('app-chat-footer.Hay un archivo de audio pendiente para enviar').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
      return;
    }

    // Si es web (no móvil), usar input file
    if(!this.platform.is('ios') && !this.platform.is('android')){
      this.adjuntarImagenWeb();
    }
    else{
      // Para móvil usar Capacitor Camera
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
        allowEditing: false,
        resultType: CameraResultType.Base64
      });
    
      this.message.imagen = 'data:image/jpeg;base64,' + image.base64String;
    }
  }

  // Nueva función para web
  public adjuntarImagenWeb() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*'; // Solo imágenes
    
    fileInput.addEventListener('change', (event) => {
      const selectedFile = (event.target as HTMLInputElement).files?.[0];
      
      if (selectedFile) {
        // Verificar que sea una imagen
        if (!selectedFile.type.startsWith('image/')) {
          this.translate.get('app-chat-footer.Solo se permiten archivos de imagen').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText);
          });
          return;
        }
        
        // Verificar tamaño (máximo 5MB para imágenes)
        if (selectedFile.size > 5 * 1024 * 1024) {
          this.translate.get('El archivo supera el tamaño máximo permitido (5MB).').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText);
          });
          return;
        }
        
        // Convertir a base64
        const reader = new FileReader();
        reader.onload = (e) => {
          this.message.imagen = e.target?.result as string;
        };
        reader.readAsDataURL(selectedFile);
      }
    });
    
    fileInput.click();
  }


  public deleteImage(): void {
   // console.log('Imagen borrada');
    this.message.imagen = null;
    this.message.urlImagen = null;
    this.message.selectedFile=null;
    this.pdfImagen=null;
    this.pdfData=null;
    this.selectedFile=null;
  }


  public onSendText(): void {
    this.sendText.emit(this.message);
    this.initMessage();
  }

  public initMessage():void{
    this.message = {
      texto: "",
      avatar: null,
      imagen: null,
      archive:null,
      selectedFile:null,
      created_at: Date.now()
    }
    this.selectedFile=null;
    this.pdfImagen=null;
    this.pdfData=null;
    this.audioBase64=null;
    this.blobAudio=null;
    this.tiempoTranscurrido = 0;
    this.displayTemporizador = '00:00.00';
    this.isDisabled=false;
  }



  public adjuntarArchivo() {


    if(this.mostrarAudio){
      //this.utilities.showToast('Se está realizando una grabación de audio');
      this.translate.get('app-chat-footer.Se está realizando una grabación de audio').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
      return;

    }
    else if(this.audioBase64!=null){

      this.translate.get('app-chat-footer.Hay un archivo de audio pendiente para enviar').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
          return;

    }
    //console.log('-----------------');


    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf'; // Only allow PDF files
   // fileInput.accept = 'image/*'

    fileInput.addEventListener('change', async (event) => {
        const selectedFile = (event.target as HTMLInputElement).files[0];

        if (selectedFile) {
            // Check if the file is a PDF
            if (selectedFile.type !== 'application/pdf') {
              this.translate.get('app-chat-footer.Solo se permiten archivos .pdf').subscribe((translatedText: string) => {
                this.utilities.showToast(translatedText);
              });
              console.error('Error: Solo se permiten archivos PDF.');
              return;
            }

            const fileName = selectedFile.name;
            const fileSize = selectedFile.size;

           // console.log("Nombre del archivo: ", fileName);
            console.log("Tamaño del archivo: ", fileSize, "bytes");
            if (fileSize > 2.5 * 1024 * 1024) { // 2.5MB en bytes
              console.log("El archivo supera el tamaño máximo permitido (2.5MB).");
              this.translate.get('El archivo supera el tamaño máximo permitido (2.5MB).').subscribe((translatedText: string) => {
                this.utilities.showToast(translatedText);
              });
              return;
            } 
            console.log("despues");

            this.selectedFile=selectedFile;
            this.message.selectedFile=selectedFile;

             // Leer el archivo como ArrayBuffer para usar con PDF.js
             const arrayBuffer = await selectedFile.arrayBuffer();

             // Usar PDF.js para cargar el archivo PDF y contar el número de páginas
            // const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            // const numPages = pdf.numPages;
 
             

            const reader = new FileReader();

            reader.onload = (e: any) => {
                const base64pdf = e.target.result;
               // console.log("PDF seleccionado: ", base64pdf);

                // No need to change the extension since it's already a PDF
                // You can now use base64pdf as needed in your application

                this.message.archive = base64pdf;
                this.message.pdfData=[fileName,fileSize];
                //this.pdfImagen=base64pdf;

                // Aquí puedes enviar base64pdf a Laravel u otro servidor
                this.loadPdf(base64pdf);
            };

            reader.readAsDataURL(selectedFile); // Convert the file to base64
        }
    });

    fileInput.click(); // Open the file selection dialog
  }



  public adjuntarArchivoConProgreso() {
    if (this.mostrarAudio) {
      this.translate.get('app-chat-footer.Se está realizando una grabación de audio').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
      return;
    } else if (this.audioBase64 != null) {
      this.translate.get('app-chat-footer.Hay un archivo de audio pendiente para enviar').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
      return;
    }
  
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf';
  
    fileInput.addEventListener('change', async (event) => {
      const selectedFile = (event.target as HTMLInputElement).files[0];
  
      if (selectedFile) {
        if (selectedFile.type !== 'application/pdf') {
          this.translate.get('app-chat-footer.Solo se permiten archivos .pdf').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText);
          });
          return;
        }
  
        const fileName = selectedFile.name;
        const fileSize = selectedFile.size;
  
        if (fileSize > 2.5 * 1024 * 1024) {
          this.translate.get('El archivo supera el tamaño máximo permitido (2.5MB)').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText);
          });
          return;
        }
  
        // 📤 Subida real del archivo con barra de progreso
        this.subirPdfConProgreso(selectedFile).subscribe((res) => {
          this.message.archive = res.path; // path desde Laravel
          this.message.pdfData = [res.original_name, res.file_size];
  
          // ✅ Si querés mostrar miniatura
          //this.loadPdfFromFile(selectedFile);
        });
      }
    });
  
    fileInput.click();
  }
  




  subirPdfConProgreso(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('nombre', file.name);
    formData.append('tamano', file.size.toString());
  
    /*return this.http.post('https://tuservidor.com/api/upload-pdf', formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      tap(event => {
        if (event.type === HttpEventType.UploadProgress) {
          let uploadProgress = Math.round(100 * event.loaded / (event.total || 1));
          console.log('Progreso:', uploadProgress + '%');
        }
      }),
      filter(event => event.type === HttpEventType.Response),
      map((event: any) => event.body)
    );*/

  console.log("Cabecera",this.api.httpOptionsFiles.headers);
  console.log("Peticion subida");
    
    return this.http.post('https://in-situ360.com/api/auth/upload-pdf', formData, {
      headers: this.api.httpOptionsFiles.headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      tap(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const uploadProgress = Math.round(100 * event.loaded / (event.total || 1));
          console.log('Progreso:', uploadProgress + '%');
          //this.uploadProgress = uploadProgress;
        }
      }),
      filter(event => event.type === HttpEventType.Response),
      map((event: any) => event.body)
    );
  }



  async loadPdf(pdfData: string) {
    try {
        // Convertir base64 a ArrayBuffer
        const byteCharacters = atob(pdfData.split(',')[1]); // Ignora la parte del encabezado del base64 (data:application/pdf;base64,...)
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        // Cargar el PDF usando el ArrayBuffer convertido
        const loadingTask = getDocument({ data: byteArray });
        const pdf: PDFDocumentProxy = await loadingTask.promise;
        //console.log('PDF cargado');

        // Extrae la primera página como imagen
        const page: PDFPageProxy = await pdf.getPage(1); // Cambia el número de página según sea necesario

        const scale = 1.5; // Escala para la imagen
        const viewport = page.getViewport({ scale });

        // Preparar canvas para renderizar la página
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Renderizar la página en el canvas
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        await page.render(renderContext).promise;

        // Convertir canvas a imagen base64
        this.pdfImagen = canvas.toDataURL();
       //console.log('Imagen de la página:', this.pdfImagen);
    } catch (error) {
        console.error('Error al cargar el PDF:', error);
    }
}



  procesarArchivo(event: any) {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const base64img = e.target.result;
       // console.log("Imagen seleccionada: ", base64img);

        // Puedes usar base64img como imagen en tu aplicación
        // Ejemplo: this.user.avatar = base64img;
      };

      reader.readAsDataURL(selectedFile); // Convierte el archivo en base64
    }
  }


  public async solicitarPermisos() {
    const resultado = await VoiceRecorder.requestAudioRecordingPermission();
    this.tienePermiso = resultado.value;

    if (!resultado.value) {
      console.error('No se tienen permisos para grabar audio.');
    }
  }


  iniciarTemporizador() {
    this.temporizador = setInterval(() => {
      this.tiempoTranscurrido += 10;
      this.displayTemporizador = this.formatearTiempo(this.tiempoTranscurrido);
    }, 10);
  }

  detenerTemporizador() {
    clearInterval(this.temporizador);
  }





  formatearTiempo(ms: number): string {
    const minutos = Math.floor(ms / 60000);
    const segundos = ((ms % 60000) / 1000).toFixed(2);
    return `${this.llenarConCero(minutos, 2)}:${this.llenarConCero(segundos, 5)}`;
  }

  llenarConCero(num: number | string, tamaño: number): string {
    let s = String(num);
    while (s.length < tamaño) s = '0' + s;
    return s;
  }


  async reiniciarGrabacion() {
    this.grabando = true;
        this.pausado = false;
this.entroEnComprobar=false;
    this.mostrarAudio=true;
        
    
    this.audioBase64=null;
    this.tiempoTranscurrido = 0;
    this.displayTemporizador = '00:00.00';

    

      if(this.audioBase64==null){
        Keyboard.hide();  // Cierra el teclado en dispositivos móviles
        this.isDisabled=true;
        setTimeout(async () => {
        
        this.iniciarTemporizador();
        await VoiceRecorder.startRecording();
      }, 500);
      }
    
    
  }

  async iniciarGrabacion() {
    this.entroEnComprobar=false;
    this.ocultarAudio=false;
    if(this.mostrarAudio==false){

      if(this.audioBase64==null){
        this.grabando = true;
        Keyboard.hide();  // Cierra el teclado en dispositivos móviles
        this.isDisabled=true;
        setTimeout(async () => {
        this.mostrarAudio=true;
        this.grabando = true;
        this.pausado = false;
        this.iniciarTemporizador();
        await VoiceRecorder.startRecording();
      }, 500);
      }
    }
    else{
      this.translate.get('app-chat-footer.Ya hay una grabación en proceso').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
    }
  }

  async pausarGrabacion() {
    this.grabando = false;
    this.pausado = true;
    this.detenerTemporizador();
    const resultado: GenericResponse = await VoiceRecorder.pauseRecording();
    if (resultado.value) {
      //console.log('Grabación pausada:', resultado.value);
    }
  }

  async reanudarGrabacion() {
    this.grabando = true;
    this.pausado = false;
    this.entroEnComprobar=false;
    this.iniciarTemporizador();
    await VoiceRecorder.resumeRecording();
  }

  async detenerGrabacion() {
    this.grabando = false;
    this.detenerTemporizador();
    const resultado: RecordingData = await VoiceRecorder.stopRecording();
    if (resultado.value) {
      this.audioBase64 = resultado.value.recordDataBase64;
      //console.log(this.audioBase64);
      //console.log('----------');
      this.blobAudio = this.base64ABlob(this.audioBase64, 'audio/mp3');
     // console.log('Grabación detenida, blob de audio:', this.blobAudio);
      this.mostrarAudio=false;
      
    }
    
  }

  base64ABlob(base64: string, tipoContenido: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: tipoContenido });
  }


  eliminarGrabacion(){
    
    this.detenerGrabacion();
    this.mostrarAudio=false;

    this.audioBase64=null;
    this.tiempoTranscurrido = 0;
    this.displayTemporizador = '00:00.00';
    this.isDisabled=false;
    this.comprobacionParaOcultarAudio();
    
  }


  async enviarAudio(){

    if(this.grabando){
      this.grabando = false;
      this.detenerTemporizador();
      const resultado: RecordingData = await VoiceRecorder.stopRecording();
      if (resultado.value) {
        this.audioBase64 = resultado.value.recordDataBase64;
        //console.log(this.audioBase64);
        //console.log('----------');
        this.blobAudio = this.base64ABlob(this.audioBase64, 'audio/mp3');
        // console.log('Grabación detenida, blob de audio:', this.blobAudio);
        this.mostrarAudio=false;
      }

    }

    this.message.audiobase64 = this.audioBase64;
    this.message.audiodata = this.blobAudio;
    //console.log('enviando');
    this.sendText.emit(this.message);
    this.initMessage();
    this.ocultarAudio=true;
    this.entroEnComprobar=false;
    
  }



  comprobacionParaOcultarAudio() {
   // setTimeout(() => {
        console.log("dentro");
        console.log(this.mostrarAudio);
        console.log(this.audioBase64);

        if (this.entroEnComprobar) {
            this.ocultarAudio = true;
        } else {
            this.entroEnComprobar = true;
        }
   // }, 500); // Retraso de medio segundo (500 ms)
}

}

/**

Adaptá tu adjuntarArchivo() así:

ts
Copiar
Editar
fileInput.addEventListener('change', async (event) => {
  const selectedFile = (event.target as HTMLInputElement).files[0];

  if (selectedFile && selectedFile.type === 'application/pdf') {
    if (selectedFile.size > 2.5 * 1024 * 1024) {
      this.translate.get('El archivo supera el tamaño máximo permitido (2.5MB).').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
      return;
    }

    // Subir archivo y esperar respuesta con path
    this.subirPdfConProgreso(selectedFile).subscribe((res) => {
      this.message.archive = res.path; // ruta desde el backend
      this.message.pdfData = [res.original_name, res.file_size]; // lo que te devuelve Laravel

      // Opcional: podés mostrar el PDF en miniatura si querés
      this.loadPdfFromFile(selectedFile);
    });
  }
});



 */
