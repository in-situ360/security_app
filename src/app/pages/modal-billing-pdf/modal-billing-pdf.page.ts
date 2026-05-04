import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, NavController, NavParams, Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { Capacitor } from '@capacitor/core';
@Component({
  selector: 'app-modal-billing-pdf',
  templateUrl: './modal-billing-pdf.page.html',
  styleUrls: ['./modal-billing-pdf.page.scss'],
})
export class ModalBillingPdfPage implements OnInit {

  public id: any = '0';
  public title: any = '';

  isAndroid: boolean = false;
  isIOS: boolean = false;



  zoom: number = 1;



  public obtainPDFDefault: string = 'https://in-situ360.com/api/auth/getBillingPDF/';

  public obtainPDF: string = "";

  public base64img: string = null;
  public personalArchiveId: any = null;

  constructor(private platform: Platform,
    private modalCtrl: ModalController,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private navParams: NavParams,
    private translate: TranslateService,
    private alertController: AlertController,
    private navCtrl: NavController,
    private http: HttpClient
  ) {

    this.isIOS = this.platform.is('ios');
    this.isAndroid = this.platform.is('android');
  }

  ngOnInit() {
    this.id = this.navParams.get('id');
    this.title = this.navParams.get('title');
    this.obtainPDF = this.obtainPDFDefault + this.id;
    console.log('PDF:');
    console.log(this.obtainPDF);
  }

  ionViewDidEnter() {
    console.log(this.translate.langs.length);
    if (this.translate.langs.length == 0) {
      console.log("No idioma");
      this.utilities.saveLang('en');
    }
  }

  closeModal() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });

  }


  cambiarZoom() {
    if (this.zoom == 1) {
      this.zoom += 0.5;
    }
    else {
      this.zoom -= 0.5;
    }
  }

  downloadPdf(billingId: number, token?: string) {
    console.log('downloadPdf');

    const url = `https://in-situ360.com/api/auth/getBillingPDF/${billingId}`;

    this.http.get(url, {
      headers: token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined,
      responseType: 'blob',
      observe: 'response',
      withCredentials: false, // <- importante
    })
      .pipe(finalize(() => {
        // aquí podrías ocultar un spinner si lo usas
      }))
      .subscribe({
        next: async (res: HttpResponse<Blob>) => {
          const blob = new Blob([res.body!], { type: 'application/pdf' });

          // Nombre del archivo (del header si viene)
          let filename = this.getFileNameFromCD(res.headers.get('Content-Disposition'),
            `Factura_${String(billingId).padStart(5, '0')}.pdf`);

          if (!Capacitor.isNativePlatform()) {
            // === WEB / IONIC SERVE: igual que tu código ===
            const a = document.createElement('a');
            const objectUrl = URL.createObjectURL(blob);
            a.href = objectUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(objectUrl);
            return;
          }

          // === ANDROID / iOS (WebView): guardar y abrir/compartir ===
          try {
            // 1) Convertir Blob -> base64 para Filesystem
            const base64 = await this.blobToBase64(blob);

            // 2) Guardar en Documents (o Cache)
            const path = `facturas/${filename}`;
            await Filesystem.writeFile({
              path,
              data: base64,
              directory: Directory.Documents,
              recursive: true,
            });

            // 3) Obtener URI y lanzar visor/compartir del sistema
            const { uri } = await Filesystem.getUri({ path, directory: Directory.Documents });
            await Share.share({
              title: filename,
              text: 'Factura PDF',
              url: uri,   // file:// o content://
              dialogTitle: 'Abrir/Compartir PDF',
            });
          } catch (err) {
            console.error('No se pudo guardar/abrir el PDF en el dispositivo:', err);
            // tu toast/notificación aquí
          }
        },
        error: (err) => {
          console.error('No se pudo descargar el PDF:', err);
          // tu toast/notificación aquí
        },
      });
  }


  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }


  private getFileNameFromCD(cd?: string | null, fallback = 'archivo.pdf') {
    if (!cd) return fallback;
    const m = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
    const raw = decodeURIComponent(m?.[1] || m?.[2] || '');
    return raw || fallback;
  }
}



