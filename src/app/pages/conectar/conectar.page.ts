import { Component, OnInit } from '@angular/core';
import {ModalController, NavController, NavParams, Platform} from '@ionic/angular';
import { User } from 'src/app/models/User';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ApiService } from 'src/app/services/api.service';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-conectar',
  templateUrl: './conectar.page.html',
  styleUrls: ['./conectar.page.scss'],
})
export class ConectarPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;
  public user:User=null;
  
  contenidoTextarea: string = '';

  private language_code:string='en';

  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------
  isChargeLoading:boolean=false;

  constructor(private platform: Platform,private modalCtrl: ModalController,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private navCtrl: NavController,
    private translate: TranslateService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
  ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

  }

  ngOnInit() {

    this.user=history.state.user;
    console.log(this.user);
  }


  ionViewDidEnter() {
    console.log(this.translate.langs.length);

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
      
    
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.language_code=language;
  }




  onTextareaInput() {
    console.log(this.contenidoTextarea);
    // Puedes realizar cualquier otra lógica aquí si es necesario
  }

  enviarSolicitud(){

    if(this.contenidoTextarea && this.contenidoTextarea.trim() !== ''){
      this.isChargeLoading=true;
      //this.utilities.showLoading('');
      this.apiService.sendRequest({userId:this.user.id, message:this.contenidoTextarea, language_code:this.language_code}).subscribe((result) => {
        console.log('DATOS',result);
        if(result['state']=="COINCIDENCE"){
          //this.utilities.dismissLoading();
          this.isChargeLoading=false;
          this.translate.get('conectar.Ya hay una solicitud para ese usuario').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
          this.navCtrl.pop()
        }
        else if(result['state']=="CREATED"){
          //this.utilities.dismissLoading();
          this.isChargeLoading=false;
          this.translate.get('conectar.Solicitud creada con éxito').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
          this.navCtrl.pop()

        }
        else{
          //this.utilities.dismissLoading();
          this.isChargeLoading=false;
          this.translate.get('conectar.Resultado desconocido').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
        }
        
      

      }, error => {
        //this.utilities.dismissLoading();
        this.isChargeLoading=false;
        this.translate.get('conectar.Hubo un problema al enviar la solicitud').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        console.log(error);
      });

    }
    else{
     
      this.translate.get('conectar.El mensaje no puede estar vacio').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      
    }
  }


  goBack(){
    this.navCtrl.pop()

  }

  

  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");

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
        if (!event.url.includes('/conectar')) {
          //console.log('Saliendo de conectar, limpiando intervalos');
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
    if (this.interval) {

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:39,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`conectar: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:39,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`conectar: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('conectar: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }

  

}

