import { Component, Input, OnInit, Output, EventEmitter  } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { GlobalWorkerOptions, getDocument, PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import WaveSurfer from 'wavesurfer.js';
import { ApiService } from 'src/app/services/api.service';


@Component({
  selector: 'app-app-pnchat-item',
  templateUrl: './app-pnchat-item.component.html',
  styleUrls: ['./app-pnchat-item.component.scss'],
})
export class AppPnchatItemComponent implements OnInit {

  private wavesurfer: WaveSurfer;

  //audioUrl: string = 'http://in-situ360.com/devxerintel//storage/user-post-chats/0906202412244366dad86bdf3cf.mp3';

  
  audioUrl: string = '';
  isPlaying: boolean = false;

  pdfImagen:any=null;
  pageImage: string;
  pdfImageSrc: string;

  @Input() text: string;
  @Input() date: string;
  @Input() image: string;
  @Input() archive: any;
  @Input() icon: string;
  @Input() pdfbase64: any;
  @Input() pdfdata: any;
  @Input() urlarchiveaudio :any;
  @Input() audiobase64 :any;
  @Input() id: any;

  @Output() longPress = new EventEmitter<any>();
  private pressTimer: any;




  linkPressTimer: any = null;        // long-press específico del enlace
linkLongPressed = false;
 private urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)\b/gi;
private _linkOpenLock = false;

  constructor(private apiService: ApiService,) { 
    GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  }

  ngOnInit() {
    
    //console.log(this.pdfbase64);
    if(this.pdfdata!=null){
      console.log('pdfdata!=null');
        if(this.pdfbase64!=null){
          //console.log(this.pdfdata);
          console.log('pdfbase64!=null');
          this.loadPdf4('data:application/pdf;base64,'+this.pdfbase64);
        }
        else{
  
  
          console.log('pdfbase64==null');
  
          //this.loadPdf4('data:application/pdf;base64,'+this.pdfbase64);
  
          console.log(this.id);
        this.apiService.obtainPNMessage({ id: this.id }).subscribe((result) => {
  
          console.log("RESULTADO>>>>>>>>>>>"); 
          console.log(result);
          const pdfbase64 = result.pdfbase64;
          this.loadPdf4('data:application/pdf;base64,'+pdfbase64);
       
  
        
  
  
        }, error => {
          
          console.log(error);
        });
  
  
        }
        
      }
      
    
  }

  ngAfterViewInit() {

    console.log('el id:  ',this.id);

    console.log('>>>>>>>>>>>>>>>>');
    console.log(this.image);

    
    console.log(this.urlarchiveaudio);

    if (this.urlarchiveaudio != null && this.urlarchiveaudio != '') {
      this.audioUrl = this.urlarchiveaudio;


      this.initializeWaveSurfer();
    }

  }

  initializeWaveSurfer() {
    /*this.wavesurfer = WaveSurfer.create({
      container: '#waveform'+'-'+this.id, // Asegúrate de tener un contenedor con este id en tu template
      waveColor: 'white',
      progressColor: 'Cyan',
      height: 40
    });

    //console.log(this.audiobase64);
    const audioBlob = this.base64ToBlob(this.audiobase64, "audio/mp3");

    // Cargar un archivo de audio o URL
    //this.wavesurfer.loadBlob();
   // this.wavesurfer.load(this.audioUrl);
   this.wavesurfer.loadBlob(audioBlob);*/




   //meter if para obtener base64 de audio
   if(this.audiobase64==null){
    console.log("OBTENIENDO BASE64");
    console.log(this.id);
    this.apiService.obtainPNMessage({ id: this.id }).subscribe((result) => {

      console.log("RESULTADO>>>>>>>>>>>"); 
     console.log(result);
     // Acceder al campo 'audiobase64' del resultado
     const audioBase64 = result.audiobase64;
     console.log(audioBase64);
    this.audiobase64=audioBase64;
   

    this.wavesurfer = WaveSurfer.create({
      container: '#waveform'+'-'+this.id, // Asegúrate de tener un contenedor con este id en tu template
      waveColor: 'white',
      progressColor: 'Cyan',
      height: 40
    });

    const audioBlob = this.base64ToBlob(this.audiobase64, "audio/mp3");

      // Cargar un archivo de audio o URL
      //this.wavesurfer.loadBlob();
    // this.wavesurfer.load(this.audioUrl);
    this.wavesurfer.loadBlob(audioBlob);


    }, error => {
      
      console.log(error);
    });


  
    
  }
  else{

    this.wavesurfer = WaveSurfer.create({
      container: '#waveform'+'-'+this.id, // Asegúrate de tener un contenedor con este id en tu template
      waveColor: 'white',
      progressColor: 'Cyan',
      height: 40
    });


    const audioBlob = this.base64ToBlob(this.audiobase64, "audio/mp3");

      // Cargar un archivo de audio o URL
      //this.wavesurfer.loadBlob();
    // this.wavesurfer.load(this.audioUrl);
    this.wavesurfer.loadBlob(audioBlob);

  }














  }


  

  

  openPDF(pdfUrl: string){
    const link = document.createElement('a');
    link.setAttribute('target', '_blank'); // Abrir en una nueva pestaña si es posible
    link.setAttribute('href', pdfUrl);
    link.setAttribute('download', ''); // Este atributo indica al navegador que debe descargar el archivo en lugar de navegar a él
    document.body.appendChild(link);
    link.click(); // Simular clic en el enlace
    document.body.removeChild(link); // Limpiar después de la descarga
  }



  async loadPdf4(pdfData: string) {
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
       // console.log('Imagen de la página:', this.pdfImagen);
    } catch (error) {
        console.error('Error al cargar el PDF:', error);
    }
}


formatFileSize(sizeInBytes: number): string {

  if(sizeInBytes==null){
    return '';
  }

  if (sizeInBytes < 1024) {
    return `${sizeInBytes} bytes`;
  } else if (sizeInBytes < 1048576) {
    return `${(sizeInBytes / 1024).toFixed(2)} KB`;
  } else if (sizeInBytes < 1073741824) {
    return `${(sizeInBytes / 1048576).toFixed(2)} MB`;
  } else {
    return `${(sizeInBytes / 1073741824).toFixed(2)} GB`;
  }
}






 base64ToBlob(base64, mime) {
  const sliceSize = 512;
  const byteCharacters = atob(base64);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; sliceIndex++) {
      const begin = sliceIndex * sliceSize;
      const end = Math.min(begin + sliceSize, bytesLength);

      const bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; offset++, i++) {
          bytes[i] = byteCharacters.charCodeAt(offset);
      }

      byteArrays[sliceIndex] = new Uint8Array(bytes);
  }

  return new Blob(byteArrays, { type: mime });
}


togglePlayback() {
  if (this.wavesurfer.isPlaying()) {
    this.wavesurfer.pause();
    this.isPlaying = false; // Actualizar el estado de reproducción
  } else {
    this.wavesurfer.play();
    this.isPlaying = true; // Actualizar el estado de reproducción
  }
}


    startPress() {
      this.pressTimer = setTimeout(() => {
        this.longPress.emit(this.id);
      }, 1000); // 1 segundo
    }

    cancelPress() {
      clearTimeout(this.pressTimer);
    }








// Divide el texto en tokens: { link: boolean, text: string }
tokenizeText(input: string): Array<{link: boolean, text: string}> {
  const s = input || '';
  const tokens: Array<{link: boolean, text: string}> = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = this.urlRegex.exec(s)) !== null) {
    const start = m.index;
    const end = this.urlRegex.lastIndex;

    // Texto previo (no enlace)
    if (start > lastIndex) {
      tokens.push({ link: false, text: s.slice(lastIndex, start) });
    }

    // URL detectada (separa posible puntuación final para no romper el link)
    let url = m[0];
    const trailingMatch = url.match(/[).,!?;:]+$/); // puntuación al final
    let trailing = '';
    if (trailingMatch) {
      trailing = trailingMatch[0];
      url = url.slice(0, -trailing.length);
    }

    tokens.push({ link: true, text: url });        // el enlace
    if (trailing) tokens.push({ link: false, text: trailing }); // puntuación suelta

    lastIndex = end;
  }

  // Resto del texto
  if (lastIndex < s.length) {
    tokens.push({ link: false, text: s.slice(lastIndex) });
  }

  return tokens;
}

// Asegura protocolo cuando solo viene "www."
normalizeUrl(value: string): string {
  const s = (value || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (/^www\./i.test(s)) return 'https://' + s;
  return 'https://' + s; // fallback por si te llega sin protocolo
}


 


openLink(raw: string, ev?: PointerEvent) {
  console.log('llego', ev?.type);
  ev?.preventDefault();
  ev?.stopPropagation();
  const url = this.normalizeUrl(raw);
  window.open(url, '_blank', 'noopener');
}






// ===== Enlace =====
onLinkPointerDown(ev: PointerEvent) {
  ev.preventDefault();
  ev.stopPropagation();

  this.clearLinkPress();
  this.linkLongPressed = false;

  this.linkPressTimer = setTimeout(() => {
    this.linkLongPressed = true;
    // disparamos la misma acción de long-press que en el contenedor
    this.longPress.emit(this.id);
  }, 600);
}

onLinkPointerUp(raw: string, ev: PointerEvent) {

  if (this._linkOpenLock) return;
  this._linkOpenLock = true;
  setTimeout(() => (this._linkOpenLock = false), 300);
  ev.preventDefault();
  ev.stopPropagation();

  const wasLong = this.linkLongPressed;
  this.clearLinkPress();

  if (!wasLong) {
    // Tap corto: abrir enlace
    this.openLink(raw); // tu función actual abre window.open/Capacitor Browser
  }
  // Si fue long-press, NO abrimos el enlace
}

onLinkPointerCancel() {
  this.clearLinkPress();
}

private clearLinkPress() {
  if (this.linkPressTimer) {
    clearTimeout(this.linkPressTimer);
    this.linkPressTimer = null;
  }
  this.linkLongPressed = false;
}




}
