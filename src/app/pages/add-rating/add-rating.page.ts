import { Component, OnInit } from '@angular/core';
import {IonRouterOutlet, ModalController, NavController, NavParams, Platform} from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { User } from 'src/app/models/User';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, AbstractControl  } from '@angular/forms';
import { Keyboard } from '@capacitor/keyboard';

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { RatingModalPage } from '../rating-modal/rating-modal.page';

@Component({
  selector: 'app-add-rating',
  templateUrl: './add-rating.page.html',
  styleUrls: ['./add-rating.page.scss'],
})
export class AddRatingPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;
  show:boolean=true;
  //public userId:any=-1;
  public userValoredId:any=-1;
  public user: User;
  rating: any = 0;
  contenidoTextarea: string = '';

  stars: Array<number> = [0, 1, 2, 3, 4];


  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  public language_code:string='en';

  isChargeLoading:boolean=false;

  constructor(private platform: Platform,
    private modalCtrl: ModalController,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private navCtrl: NavController,
    private router: Router,//SEGUIMIENTO DE TIEMPO
    private translate: TranslateService,
  private routerOutlet: IonRouterOutlet,) {
      this.isIOS=this.platform.is('ios');
      this.isAndroid=this.platform.is('android');
    }

  ngOnInit() {
    

  }

  ionViewDidEnter() {
    if (this.platform.is('ios')) {
      this.routerOutlet.swipeGesture = false; // desactiva swipe-back
    }
  }

  ionViewWillEnter() {


    console.log("SE EJECUTA ionViewWillEnter");




    this.utilities.getLang().then((result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo==null) {
        console.log("No idioma");
        this.utilities.saveLang('en');
  
        
      } else {
        
        this.switchLanguage(prefijo || 'en');
      }
    });


   
  

  





    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
        console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
        // this.startInterval();
      }
      else{
        // this.clearInterval();

      }
      
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Verifica si la ruta actual no es '/UserSearch'
        if (!event.url.includes('/add-rating')) {
         // console.log('Saliendo de add-rating, limpiando intervalos');
          // this.clearInterval();
        }
        else{
          // this.startInterval();
        }
      }
    });

   

    if(this.interval==null){
      // this.startInterval();
    }



    console.log("Entro en ionViewWillEnter");

  //  this.userId=history.state.userId ?? -1;
    this.userValoredId=history.state.userValoredId ?? -1;

    //this.userValoredId=48;

    this.apiService.obtainOtherUser({userId: this.userValoredId, language_code:'en'}).subscribe((result) => {
      console.log('DATOS',result);
      this.user=result;
     // this.userLabels=this.user.translateUserLabels;

    }, error => {
      
      this.translate.get('add-rating.No se pudo obtener los datos del usuario').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });
   
  }


  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.language_code=language;
  }

  goBack() {
    
   /* this.navCtrl.navigateBack('/user-ratings', {
      state: { userValoredId: this.userValoredId } // Pasar userValoredId en el estado de navegación
    });*/
    this.navCtrl.pop()
  }

  formatLabel(value: number): string {
    return value.toFixed(1); // Muestra el número con un decimal
  }

  onTextareaInput() {
    console.log(this.contenidoTextarea);
    // Puedes realizar cualquier otra lógica aquí si es necesario
  }


  getStarColor(index: number): string {
    const fractional = this.rating - index;

    if (fractional >= 1) {
      // Star is fully filled
      return 'assets/icons/estrella-valoracion.svg'; // Pink star
    } else if (fractional > 0) {
      // Star is partially filled
      return 'assets/icons/estrella-half.svg'; // You'd need an SVG for half stars
    } else {
      // Star is empty
      return 'assets/icons/estrella-gris.svg'; // Gray star
    }
  }

  isActive(index: number): boolean {
    return index < this.rating;
  }

  updateStars() {
    // Trigger re-render of stars on rating change
    console.log(`Current rating: ${this.rating}`);
  }

  onEnterPress(event: KeyboardEvent) {
    // Verificar si la tecla presionada es Enter
    if (event.key === 'Enter') {
      console.log("Se pulsó Enter");
      Keyboard.hide();  // Cierra el teclado en dispositivos móviles
      console.log("///");
    }
    
  }


  sendRating() {
  console.log("rating: ", this.rating);
  console.log("userValoredId: ", this.userValoredId);
  console.log("message (original): ", this.contenidoTextarea);

  if (!this.rating || this.rating <= 0) {
    this.translate.get('Debe seleccionar una valoración.').subscribe((translatedText: string) => {
      this.utilities.showToast(translatedText);
    });
    return;
  }

  // Si es null/undefined → lo convertimos en cadena vacía
  let mensajeLimpio = (this.contenidoTextarea || '').trim();

  // Si son solo espacios, lo dejamos vacío
  if (mensajeLimpio.length === 0) {
    mensajeLimpio = '';
  }

  this.isChargeLoading = true;

  this.apiService.sendRating({
    message: mensajeLimpio, // ahora es texto limpio o vacío
    userValoredId: this.userValoredId,
    ratingValue: this.rating,
    language_code: this.language_code
  }).subscribe((result) => {
    console.log('DATOS', result);
    this.isChargeLoading = false;

    this.translate.get('add-rating.¡Valoracion enviada!').subscribe((translatedText: string) => {
      setTimeout(async () => {
        this.abrirModalRating();
      }, 500);
    });

  }, error => {
    this.isChargeLoading = false;
    console.log(error);
  });
}

  

  
  ionViewWillLeave() {
    console.log("Se ejecuta ionViewWillLeave");

    if (this.platform.is('ios')) {
        this.routerOutlet.swipeGesture = true; // restaura comportamiento por defecto
      }
    // this.clearInterval();
  }

  
  ngOnDestroy() {
    // this.clearInterval();
  }

  


  // Inicia el intervalo para ejecutar la función cada 5 segundos
  private startInterval() {
    this.countSeg=0;
    this.previousDate=new Date();
    if(this.interval==null){
      console.log("INTERVAL NULL CREANDO UNO NUEVO-----------------------------------");
      this.interval = setInterval(() => {
        this.checkDateDifference();
      }, 2000);
    }
    
  }

  // Limpia el intervalo cuando se sale de la pestaña
  private clearInterval() {
    if (this.interval) {

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:11,screenTime:this.countSeg}).subscribe((result) => {
        console.log('DATOS',result);
        
      }, error => {
        
        console.log(error);
      });

     // clearInterval(this.interval);
      //this.interval = null;
    }
    clearInterval(this.interval);
    this.interval = null;
    
  }


  // Calcula la diferencia entre la fecha anterior y la actual
  private checkDateDifference() {
    const currentDate = new Date();


    if(!this.isActive2){

      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg=this.countSeg+differenceInSeconds;
      console.log(`add-rating: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:11,screenTime:this.countSeg}).subscribe((result) => {
        console.log('DATOS',result);
        
      }, error => {
        
        console.log(error);
      });

      // this.clearInterval();
      return;
    }

   

   
    if (this.isActive2) {
      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg=this.countSeg+differenceInSeconds;
      console.log(`add-rating: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('add-rating: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }

  
  onStarClick(index: number): void {
    console.log(`Star clicked: Position ${index + 1}`);
    this.rating = index + 1; // Actualiza la calificación según la estrella seleccionada
    this.updateStars(); // Opcional, si necesitas actualizar visualmente las estrellas
  }



  async abrirModalRating(){
  
  
      let infoText=this.translate.instant('add-rating.Gracias por poner tu comentario a ');
  
      const modal = await this.modalCtrl.create({
        component: RatingModalPage,
        cssClass: 'RatingModal',
        componentProps: {
         name:this.user.name,
         info:infoText,
          
          
        },
       // backdropDismiss:false
      });

      modal.onWillDismiss().then(async () => {
       // this.navCtrl.pop();
       // hazme un back y pasale this.userValoredId con el nombre de userValoredId 
      /* this.navCtrl.navigateBack('/user-ratings', {
        state: { userValoredId: this.userValoredId } // Pasar userValoredId en el estado de navegación
      });*/
      this.navCtrl.pop()
      });

      return await modal.present();
    }

}
