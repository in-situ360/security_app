import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
//import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit {
  public chargeSplash: any = false;
  public seEjecutaSplash: any = false;

  @ViewChild('splashVideo', { static: true }) splashVideo!: ElementRef;
  @ViewChild('splashVideo', { static: false })
  videoElement!: ElementRef<HTMLVideoElement>;

  constructor(
    private apiService: ApiService,
    private utils: UtilitiesService,
    /*public screenOrientacion: ScreenOrientation,*/ private navCtrl: NavController,
    private auth: AuthenticationService,
  ) {
    // this.screenOrientacion.lock(this.screenOrientacion.ORIENTATIONS.PORTRAIT);
  }

  ngOnInit() {}

  ionViewWillEnter() {
    // Siempre mostrar el splash cuando el usuario esté logueado
    this.chargeSplash = true;
    console.log('Mostrando splash al iniciar la app');

    // this.utils.getChargeSplash().then((result) => {
    //   const state = result;
    //   console.log(state);
    //   if(state==null || state==false) {
    //    console.log("NUNCA SE CARGO EL SPLASH");
    //    this.chargeSplash=true;
    //    this.utils.saveChargeSplash(true);
    //   }
    //   else{
    //     this.chargeSplash=false;
    //     console.log("YA SE CARGO EL SPLASH PREVIAMENTE");
    //   }
    // });

    //this.chargeSplash=true;
    /*setTimeout(() => {

      this.auth.authenticationState.subscribe(token => {
        console.log("ESTADO TOKEN ", token);
        if (token == 'logout' || token == '') {
          if(this.chargeSplash==true){
            this.chargeSplash=false;
            this.navCtrl.navigateRoot("languaje-select", { state: { isFromSplash:true }});
          }
          
        }

      });

      //
    }, 20000);*/
  }

  onVideoEnd() {
    console.log('🎬 Video finalizado, redirigiendo...');
    this.apiService.setShowModalSplash(false);

    this.auth.authenticationState.subscribe((token) => {
      console.log('ESTADO TOKEN ', token);
      if (token == 'logout' || token == '') {
        if (this.chargeSplash == true) {
          this.chargeSplash = false;
          this.navCtrl.navigateRoot('languaje-select', {
            state: { isFromSplash: true },
          });
        } else {
          this.navCtrl.navigateRoot('cover-page');
        }
      } else {
        // Usuario logueado - navegar al home después del splash
        this.navCtrl.navigateRoot('tabs');
      }
    });
  }

  /*ngAfterViewInit() {
    if (this.videoElement) {
      this.videoElement.nativeElement.oncanplaythrough = () => {
        this.showVideo();
      };
    }
  }*/

  /*	
  showVideo() {
    this.utils.getChargeSplash().then((result) => {
    if (this.videoElement) {
      this.videoElement.nativeElement.classList.add('visible-video');
      const video = this.videoElement.nativeElement;
      video.muted = true; // Iniciar en mute para que se reproduzca
      video.play().then(() => {
        setTimeout(() => {
	    try { 	
         // if(this.chargeSplash){
                video.muted = false; // Activar sonido después de que inicie
         // }
                video.play(); // Asegurar la reproducción
             } catch (e) {
               console.warn("No se pudo activar sonido:", e);
             }


        }, 500);
      }).catch(error => {
        console.log("⚠️ Error al activar sonido: ", error);
      });
    
    }

  });
  }*/

  showVideo() {
    this.utils.getChargeSplash().then(() => {
      const video = this.videoElement?.nativeElement;

      if (!video) {
        console.warn('⚠ No existe videoElement — fallback inmediato');
        this.onVideoEnd();
        return;
      }

      video.classList.add('visible-video');
      video.muted = true;

      // 🔹 Cuando el video termine → navega
      video.onended = () => {
        console.log('🎬 Video finalizado (onended)');
        this.onVideoEnd();
      };

      // 🔹 Intentar reproducir
      video
        .play()
        .then(() => {
          setTimeout(() => {
            try {
              video.muted = false;
              video.play();
            } catch (e) {
              console.warn('No se pudo activar audio:', e);
            }
          }, 500);
        })
        .catch((err) => {
          console.warn('⚠ Error reproduciendo video:', err);
          // 🔹 Reproducción falló: navegar igual
          this.onVideoEnd();
        });

      // 🔹 Fallback por si nada de lo anterior se ejecuta (3s)
      setTimeout(() => {
        if (!video.paused) return; // si está reproduciendo bien, no hacemos nada
        console.warn('⏳ Timeout de 3s en splash → navegando');
        this.onVideoEnd();
      }, 3000);
    });
  }

  ionViewWillLeave() {
    console.log('⏹ Deteniendo video del splash...');
    if (this.videoElement) {
      const video = this.videoElement.nativeElement;
      video.pause(); // 🔹 Pausa el video
      video.currentTime = 0; // 🔹 Reinicia el tiempo a 0
      video.src = ''; // 🔹 Elimina la fuente del video para evitar que siga cargado en memoria
      video.load(); // 🔹 Recarga el elemento de video para resetearlo
    }
  }
}
