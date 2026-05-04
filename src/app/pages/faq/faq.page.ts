import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TranslateService } from '@ngx-translate/core'; // MULTI LENGUAJE


import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
})
export class FAQPage implements OnInit {
  // Ahora routeMap almacena un arreglo de rutas por cada id
  routeMap: { [key: number]: string[] } = {
    1: ['/suscription'],
    2: ['/suscription'],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: ['/suscription'],
    10: ['/highlight-profile','/my-ads'],
    11: [],
    12: [],
    13: [],
    14: [],
    // Añadir más rutas si es necesario para otras preguntas
  };

  public faqItems: any[] = [];  // Lista de preguntas y respuestas
  selectedQuestion: number | null = null;  // Indice de la pregunta seleccionada

  isAndroid: boolean = false;
  isIOS: boolean = false;

  private language_code: string = 'en';


  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  constructor(
    private translate: TranslateService,
    private utilitiesService: UtilitiesService,
    private platform: Platform,
    private apiService: ApiService,
    private navCtrl: NavController,
    private router: Router,//SEGUIMIENTO DE TIEMPO
  ) {
    this.isIOS = this.platform.is('ios');
    this.isAndroid = this.platform.is('android');
  }

  ngOnInit() {}

  ionViewDidEnter() {
    this.utilitiesService.getLang().then((result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo==null) {
        console.log("No idioma");
        this.utilitiesService.saveLang('en');
        
        
      } else {
        
        this.switchLanguage(prefijo || 'en');
        this.language_code=prefijo;
      }

      this.obtainFrequentlyQuestions();
    });

    
    
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.language_code=language;
  }

  goBack() {
    this.navCtrl.pop();
  }

  goVirtualAssistant() {
    this.navCtrl.navigateForward("/virtual-assistant");
  }

  // Toggle answer visibility
  toggleAnswer(index: number) {
    this.selectedQuestion = this.selectedQuestion === index ? null : index;
  }

  // Obtener preguntas frecuentes desde el servicio
  public obtainFrequentlyQuestions() {
    this.apiService.obtainFrequentlyQuestions({ language_code: this.language_code }).subscribe((result) => {
      console.log('DATOS', result);
      this.faqItems = result;
      this.utilitiesService.dismissLoading();
    }, error => {
      /*this.translate.get('No se pudo obtener el listado de proyectos').subscribe((translatedText: string) => {
        this.utilitiesService.showToast(translatedText);
      });*/
      this.utilitiesService.dismissLoading();
      console.log(error);
    });
  }

  // Navegar a la página correspondiente
  goPage(route: string) {
    this.navCtrl.navigateForward(route);
  }








  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
        const currentRoute = this.router.url;
        if(currentRoute.includes('/faq')){
          console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
          // this.startInterval();
        }
      }
      else{
        // this.clearInterval();

      }
      
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Verifica si la ruta actual no es '/UserSearch'
        if (!event.url.includes('/faq')) {
         // console.log('Saliendo de faq, limpiando intervalos');
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


  }

  
  ionViewWillLeave() {
    console.log("Se ejecuta ionViewWillLeave");
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

    if(this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
      console.log("Suscripción al router cancelada correctamente");
    }

    if (this.interval) {

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:27,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`faq: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:27,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`faq: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('faq: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }

  

}
