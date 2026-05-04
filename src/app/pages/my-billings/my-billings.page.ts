import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AlertController, ModalController, NavController, Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';


import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

// import { InAppPurchase2, IAPProduct } from '@awesome-cordova-plugins/in-app-purchase-2/ngx';




import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ModalBillingPdfPage } from '../modal-billing-pdf/modal-billing-pdf.page';




import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

@Injectable({ providedIn: 'root' })

@Component({
  selector: 'app-my-billings',
  templateUrl: './my-billings.page.html',
  styleUrls: ['./my-billings.page.scss'],
})
export class MyBillingsPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;
  public billings:any=[]

  constructor( 
    public auth: AuthenticationService, 
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private alertController: AlertController,
    private router: Router,
    private platform: Platform,
    private translate: TranslateService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private http: HttpClient) { 
      this.isIOS=this.platform.is('ios');
      this.isAndroid=this.platform.is('android');
    }

  ngOnInit() {

    this.apiService.obtainUserBillings().subscribe((result)=>{
      this.billings=result;
    }, 
    error => {
      console.log(error);
    });


  }

    goBack(){
      this.navCtrl.pop();
    }



    formatId(id: number): string {
      return id.toString().padStart(5, '0');
    }



/*
  downloadPdf(billingId: number, token?: string) {

    console.log("downloadPdf");

    const url = `https://in-situ360.com/api/auth/getBillingPDF/${billingId}`;

    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    this.http.get(url, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      responseType: 'blob',
      observe: 'response',
      withCredentials: false, // <- importante
    })
      .pipe(
        finalize(() => {
          // aquí podrías ocultar un spinner si lo usas
        })
      )
      .subscribe({
        next: (res: HttpResponse<Blob>) => {
          const blob = new Blob([res.body!], { type: 'application/pdf' });

          // Intentar extraer nombre de archivo del header si viene
          let filename = 'archivo.pdf';
          const cd = res.headers.get('Content-Disposition');
          if (cd) {
            const m = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
            const raw = decodeURIComponent(m?.[1] || m?.[2] || '');
            if (raw) filename = raw;
          }

          // Crear enlace temporal para descargar
          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(blob);
          a.href = objectUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(objectUrl);
        },
        error: (err) => {
          console.error('No se pudo descargar el PDF:', err);
          // Muestra tu notificación/toast aquí
        },
      });
  }
*/

private getFileNameFromCD(cd?: string | null, fallback = 'archivo.pdf') {
  if (!cd) return fallback;
  const m = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
  const raw = decodeURIComponent(m?.[1] || m?.[2] || '');
  return raw || fallback;
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


  async showBillingPDF($id){
   
    const modal = await this.modalCtrl.create({
          component: ModalBillingPdfPage,
          cssClass: 'MultimediaModal',
          componentProps: {
            id:$id,
            title:this.formatId($id)
          },
        // backdropDismiss:false
        });
        return await modal.present();
      
    }



}
