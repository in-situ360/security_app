import { Component, EventEmitter, Input, OnInit, Output,ViewChild } from '@angular/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Mensaje } from 'src/app/models/Mensaje';
import { ElementRef } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Keyboard } from '@capacitor/keyboard';


import * as pdfjsLib from 'pdfjs-dist/webpack';
import { GlobalWorkerOptions, getDocument, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';



import { VoiceRecorder, RecordingData, GenericResponse } from 'capacitor-voice-recorder';

import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

import { Observable, tap, filter, map } from 'rxjs';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-app-pnchat-footer',
  templateUrl: './app-pnchat-footer.component.html',
  styleUrls: ['./app-pnchat-footer.component.scss'],
})
export class AppPnchatFooterComponent implements OnInit {

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

  public textGrabFin:string='';
  public textPulseAqui:string='';

  public selectedFile:any=null;

  constructor(private api:ApiService,private http: HttpClient,private platform: Platform,private utilities: UtilitiesService,private translate: TranslateService) { 
    GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  }

  ngOnInit() {
    this.initMessage();



    this.solicitarPermisos();//audio

    this.textGrabFin=this.translate.instant('app-pgchat-footer.Grabación finalizada');
    this.textPulseAqui=this.translate.instant('app-pgchat-footer.Pulse aquí para enviar');
    
  }





  public async addImage() {

    /*if(!this.platform.is('ios') && !this.platform.is('android')){
      this.adjuntarArchivo();
    }
    else{*/

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
  
   // console.log(image);
    
    // image.webPath will contain a path that can be set as an image src.
    // You can access the original file using image.path, which can be
    // passed to the Filesystem API to read the raw data of the image,
    // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
    this.message.imagen = 'data:image/jpeg;base64,' + image.base64String;

  
    //console.log("imagen " ,this.message.imagen);


    // Can be set to the src of an image now
    //imageElement.src = imageUrl;
  //}
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
      this.utilities.showToast(this.translate.instant('app-pnchat-footer.Se está realizando una grabación de audio'));
      return;

    }
    else if(this.audioBase64!=null){

      this.utilities.showToast(this.translate.instant('app-pnchat-footer.Hay un archivo de audio pendiente para enviar'));
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
              this.utilities.showToast(this.translate.instant('app-pnchat-footer.Solo se permiten archivos .pdf'));
              console.error('Error: Solo se permiten archivos PDF.');
              return;
            }

            const fileName = selectedFile.name;
            const fileSize = selectedFile.size;

           // console.log("Nombre del archivo: ", fileName);
           // console.log("Tamaño del archivo: ", fileSize, "bytes");


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

  async iniciarGrabacion() {
    if(this.mostrarAudio==false){
      if(this.audioBase64==null){
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
      this.utilities.showToast(this.translate.instant('app-pnchat-footer.Ya hay una grabación en proceso'));
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

    this.audioBase64=null;
    this.tiempoTranscurrido = 0;
    this.displayTemporizador = '00:00.00';
    this.isDisabled=false;
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
  
    
  }


}
