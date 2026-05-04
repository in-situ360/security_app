import { Component, OnInit } from '@angular/core';
import {ModalController, NavController, NavParams, Platform, GestureController, Gesture} from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE


@Component({
  selector: 'app-modal-tags',
  templateUrl: './modal-tags.page.html',
  styleUrls: ['./modal-tags.page.scss'],
})
export class ModalTagsPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;
  public userLabels:any=[];

  public language_code:string='en';
  private gesture?: Gesture;
  

  constructor(private platform: Platform,
    private modalCtrl: ModalController,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private translate: TranslateService,
    private gestureCtrl: GestureController) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

  }

  

  ngOnInit() {
   /* this.modalCtrl.dismiss({
      'dismissed': true
    });*/
    
  }


  ionViewDidEnter() {
    console.log(this.translate.langs.length);
  
    if (this.translate.langs.length == 0) {
      console.log("No idioma");
  
      this.utilities.saveLang('en');
    }
    else{
      const currentLang = this.translate.currentLang;
      console.log("Idioma actual:", currentLang);
      //this.form.patchValue({ language_code: currentLang });
      this.language_code=currentLang;
    }

    this.obtainUserLabels();
    this.setupSwipeGesture();
  }


  public obtainUserLabels(){

    this.userLabels =[];
    
    this.apiService.obtainUserLabels({language_code:this.language_code,userId:-1}).subscribe((result) => {
      console.log('DATOS',result);
      this.userLabels=result;
   

    }, error => {
     
      this.translate.get('No se pudo obtener los tags').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });

  }

  closeModal(){
    this.modalCtrl.dismiss({
      'dismissed': true
    });

  }


  setupSwipeGesture() {
    const el = document.querySelector('ion-content'); // Selecciona el elemento donde quieres aplicar el gesto
    if (!el) return;

    this.gesture = this.gestureCtrl.create({
      el,
      gestureName: 'swipe-to-close',
      onMove: (event) => {
        // Detectar si es un deslizamiento hacia la derecha
        if (event.deltaX > 100) {
          this.closeModal(); // Cierra el modal si se desliza suficiente
        }
      },
    });

    this.gesture.enable(true); // Habilitar el gesto
  }

  ionViewWillLeave() {
    if (this.gesture) {
      this.gesture.destroy(); // Limpia el gesto al salir
    }
  }

}
