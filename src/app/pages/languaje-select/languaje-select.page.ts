import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { TranslatePipe } from '@ngx-translate/core';//MULTI LENGUAJE
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Storage } from '@ionic/storage-angular';
import {AlertController, ToastController, LoadingController, Platform, NavController } from "@ionic/angular";
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-languaje-select',
  templateUrl: './languaje-select.page.html',
  styleUrls: ['./languaje-select.page.scss'],
})
export class LanguajeSelectPage implements OnInit {

  public form: FormGroup;//local storage
  public language_code:string='en';
  isAndroid: boolean = false;
  isIOS: boolean = false;
  show:boolean=true;
  selectedLanguage: string;


  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  public sortedLanguages: { code: string; label: string }[] = [];


  private languages = [
  { code: 'es', label: 'languaje-select.Español' },
  { code: 'en', label: 'languaje-select.Inglés' },
  { code: 'de', label: 'languaje-select.Alemán' },
  { code: 'it', label: 'languaje-select.Italiano' },
  { code: 'pt', label: 'languaje-select.Portugués' }/*,
  { code: 'fr', label: 'languaje-select.Francés' },
  { code: 'ja', label: 'languaje-select.Japonés' },
  { code: 'ko', label: 'languaje-select.Coreano' },
  { code: 'ru', label: 'languaje-select.Ruso' },
  { code: 'zh-CN', label: 'languaje-select.Chino(Simplificado)' },
  { code: 'zh-TW', label: 'languaje-select.Chino(Tradicional)' },
  { code: 'ar', label: 'languaje-select.Árabe' },
  { code: 'hi', label: 'languaje-select.Hindi' },
  { code: 'bn', label: 'languaje-select.Bengalí' },
  { code: 'nl', label: 'languaje-select.Holandés' },
  { code: 'sv', label: 'languaje-select.Sueco' },
  { code: 'no', label: 'languaje-select.Noruego' },
  { code: 'fi', label: 'languaje-select.Finlandés' },
  { code: 'da', label: 'languaje-select.Danés' },
  { code: 'pl', label: 'languaje-select.Polaco' },
  { code: 'tr', label: 'languaje-select.Turco' },
  { code: 'el', label: 'languaje-select.Griego' },
  { code: 'cs', label: 'languaje-select.Checo' },
  { code: 'he', label: 'languaje-select.Hebreo' },
  { code: 'hu', label: 'languaje-select.Húngaro' },
  { code: 'vi', label: 'languaje-select.Vietnamita' },
  { code: 'id', label: 'languaje-select.Indonesio' },
  { code: 'th', label: 'languaje-select.Tailandés' },
  { code: 'ca', label: 'languaje-select.Catalán' },
  { code: 'ro', label: 'languaje-select.Romanés' },
  { code: 'uk', label: 'languaje-select.Ucraniano' },
  { code: 'sr', label: 'languaje-select.Serbio' },
  { code: 'hr', label: 'languaje-select.Croata' },
  { code: 'sk', label: 'languaje-select.Eslovaco' },
  { code: 'lv', label: 'languaje-select.Letón' },
  { code: 'et', label: 'languaje-select.Estonio' }*/
];


  constructor(private translate: TranslateService, private storage: Storage, private platform: Platform, private utils: UtilitiesService, private navCtrl: NavController, private formBuilder: FormBuilder, private apiService: ApiService,private router: Router) {
    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');
    
  }

   

  goBack(){
    this.navCtrl.pop();
  }

  

  ngOnInit() {
     //this.translateLabelsAndSort();

    if(history.state.isFromSplash){
      console.log('ocultando');
      this.show=false;
    }


    this.utils.getLang().then((result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo==null) {
        console.log("No idioma");
        this.utils.saveLang('en');
  
        
      } else {
        
        this.switchLanguage(prefijo || 'en');
      }
    });

   /* this.utils.getLang().then(storedLang => {
      if (!storedLang) {
        // Si no hay idioma guardado, establecer español por defecto
        console.log('Sin idioma guardado, estableciendo español por defecto');
        this.utils.saveLang('es'); // Guardar español como idioma por defecto
        this.translate.setDefaultLang('es'); // Establecer el idioma por defecto en el servicio de traducción
        this.switchLanguage('es'); // Cambiar el idioma de la aplicación
      } else {
        // Si hay un idioma guardado, utilizarlo
        console.log('Idioma guardado encontrado:', storedLang);
        this.translate.setDefaultLang(storedLang); // Establecer el idioma guardado como idioma por defecto
        this.switchLanguage(storedLang); // Cambiar el idioma de la aplicación
        this.selectedLanguage = storedLang;
        
      }


      //this.translate.setDefaultLang('es'); // Establezco el idioma predeterminado si no lo tiene

      this.form = new FormGroup({
        selectedLanguage: new FormControl(this.utils.getLang()),
      });
      console.log('Formulario: ',this.form.value);
    });
*/  }

  // Cambiar el idioma de la aplicación
  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.language_code=language;
    this.utils.saveLang(language);
    this.translateLabelsAndSort();
  }

  Language(event: any) {
    console.log(event.detail.value);
    this.utils.saveLang(event.detail.value);
    this.translate.setDefaultLang(event.detail.value);
    this.switchLanguage(event.detail.value);

    this.translateLabelsAndSort();
    if(!history.state.isFromSplash && history.state.isFromSettings){
      this.apiService.changeUserLanguaje({ language_code:event.detail.value  }).subscribe((result) => {
        this.apiService.userChanges2.next();
        this.apiService.laguageChanges.next();
        console.log("RESULTADO>>>>>>>>>>>"); 
        console.log(result);
        //this.utils.showToast(result);
          
      
    
        
    
    
        }, error => {
         // this.utils.showToast("UPS");
          console.log(error);
        });
    }
    else{
      //this.utils.showToast("no entra");
    }
  }


  submitForm() {

    
    //this.apiService.changeUserLanguaje({ language_code:this.language_code  }).subscribe((result) => {
      
      //console.log("RESULTADO>>>>>>>>>>>"); 
      //console.log(result);
        
      this.navCtrl.navigateForward('/cover-page');
    
  
      
  
  
   //   }, error => {
        
     //   console.log(error);
   //   });
    

    

  }



  onSelectChange(event: any) {
    console.log(event.detail.value);
   // this.form.get('state').patchValue(event.detail.value);

    

    
  }


  continue(){
    this.apiService. translatesChanges.next();
    console.log("entro");
    if(history.state.isFromSplash){
      console.log("if splash");
      this.navCtrl.navigateForward('/cover-page');
    }
    else if(!history.state.isFromSplash && history.state.isFromSettings){
      this.navCtrl.pop();
    }
    else{
      this.navCtrl.pop();
    }

  }











  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");

    this.translateLabelsAndSort();

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
        const currentRoute = this.router.url;
        if(currentRoute.includes('/languaje-select')){
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
        if (!event.url.includes('/languaje-select')) {
           // console.log('Saliendo de languaje-select, limpiando intervalos');
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
    this.clearInterval();
    // this.clearInterval();
  }

  
  ngOnDestroy() {
    this.clearInterval();
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
      this.apiService.registerTimeScreen({screenId:24,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`languaje-select: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:24,screenTime:this.countSeg}).subscribe((result) => {
        console.log('DATOS',result);
        
      }, error => {
        
        console.log(error);
      });

      this.clearInterval();
    // this.clearInterval();
      return;
    }

   

   
    if (this.isActive2) {
      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg=this.countSeg+differenceInSeconds;
      console.log(`languaje-select: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('languaje-select: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }


  private translateLabelsAndSort() {
    console.log("Se ejecuta translateLabelsAndSort");
  const translationKeys = this.languages.map(lang => lang.label);
  console.log("translationKeys-->",translationKeys);


  this.translate.get(translationKeys).subscribe(translations => {
    this.sortedLanguages = this.languages
      .map(lang => ({
        code: lang.code,
        label: translations[lang.label] || lang.label // fallback
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  });
}


}
