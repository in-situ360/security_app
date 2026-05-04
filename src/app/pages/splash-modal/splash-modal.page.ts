import { Component, OnInit } from '@angular/core';
import {ModalController, NavController, NavParams, Platform} from '@ionic/angular';
import { ViewChild, ElementRef } from '@angular/core';

import { AuthenticationService } from 'src/app/services/authentication.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-splash-modal',
  templateUrl: './splash-modal.page.html',
  styleUrls: ['./splash-modal.page.scss'],
})
export class SplashModalPage implements OnInit {

  @ViewChild('splashVideo', { static: true }) splashVideo!: ElementRef;
  @ViewChild('splashVideo', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  constructor(private modalCtrl: ModalController,) { 

  }

  ngOnInit() {
  }


  showVideo() {
    //this.utils.getChargeSplash().then((result) => {
    if (this.videoElement) {
      this.videoElement.nativeElement.classList.add('visible-video');
      const video = this.videoElement.nativeElement;
      video.muted = true; // Iniciar en mute para que se reproduzca
      video.play().then(() => {
        setTimeout(() => {
         // if(this.chargeSplash){
            video.muted = false; // Activar sonido después de que inicie
         // }
          video.play(); // Asegurar la reproducción
        }, 500);
      }).catch(error => {
        console.log("⚠️ Error al activar sonido: ", error);
      });
    
    }

  //});
  }

  onVideoEnd() {
    console.log("🎬 Video finalizado, cerrando splash...");
    this.dismiss();

    /*this.auth.authenticationState.subscribe(token => {
      console.log("ESTADO TOKEN ", token);
      if (token == 'logout' || token == '') {
        if(this.chargeSplash==true){
          this.chargeSplash=false;
          this.navCtrl.navigateRoot("languaje-select", { state: { isFromSplash:true }});
        }
        else{
          this.navCtrl.navigateRoot("cover-page");
        }
        
      }

    });*/
  }

  

  dismiss() {

    this.modalCtrl.dismiss({
     // 'dismissed': true
    });

  }

}
