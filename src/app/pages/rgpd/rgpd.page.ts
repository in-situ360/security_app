import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';


import {PdfViewerModule} from 'ng2-pdf-viewer';

import { marked } from 'marked';

@Component({
  selector: 'app-rgpd',
  templateUrl: './rgpd.page.html',
  styleUrls: ['./rgpd.page.scss'],
})
export class RGPDPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;
  pdfRoute:any="";

  public politica:any=null;

  public form: FormGroup;

    //SEGUIMIENTO DE TIEMPO
    private interval: any=null;;
    private countSeg:number;
    private previousDate: Date | null = null;
    private isActive2:boolean=true;
    private routerSubscription: Subscription;
    //-----------------------------------------
    zoom:number=1;


    public markdownRaw: string = '';
   public markdownHTML: string = '';

  constructor(
    public auth: AuthenticationService, 
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private alertController: AlertController,
    private router: Router,
    private platform: Platform,
    private translate: TranslateService,
    
    
    private navCtrl: NavController,
   ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

   this.form = new FormGroup({
         language_code: new FormControl('en'), 
         
       });

  }

  async ngOnInit() {
   /* this.markdownRaw = `
# Política de Privacidad

**Este documento es importante.**  
*Asegúrate de leerlo completo.*

## Datos que recopilamos

- Nombre
- Correo electrónico
- Ubicación

## Cómo usamos tus datos

1. Para mejorar la experiencia del usuario  
2. Para enviar actualizaciones importantes  
3. Para fines legales cuando sea necesario

> _“Tu privacidad es nuestra prioridad”_

Consulta más en [nuestra web](https://tusitio.com/politica).
`;
  this.markdownHTML = await marked.parse(this.markdownRaw);*/
  }

  async ionViewDidEnter() {
    console.log(this.translate.langs.length);


    
  
    /*if (this.translate.langs.length == 0) {
      console.log("No idioma");
  
      this.utilities.saveLang('en');
    }*/


    this.utilities.getLang().then((result) => {
      const prefijo = result;
      console.log('>>>>>>');
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo == null) {
        console.log("No idioma configurado");

        // Asignación de la ruta del PDF según el idioma
       // this.pdfRoute = "assets/icons/politicainsitu.pdf";  // Default PDF
      } else {
        if (prefijo == 'es') {
          //this.pdfRoute = "assets/icons/politicainsitu.pdf";
        } else {
          this.form.get('language_code').patchValue(prefijo);
          //this.pdfRoute = "assets/icons/PrivacyPolicyInSitu360_en.pdf";      
        }
      }

      this.apiService.getPolicyTextValue(this.form.value).subscribe(async (result) => {
      console.log('Politica valor: ',result);
      if(result!=null){
        this.politica=result; 
        this.markdownRaw = this.politica.value;
        this.markdownHTML = await marked.parse(this.markdownRaw);
      }
      
    
    }, error => {
    
      console.log(error);
    });


      
      //console.log('Ruta del PDF:', this.pdfRoute); // Verifica que la ruta esté correcta
    });
  }

  goBack(){
    this.navCtrl.pop();

  }




  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
        const currentRoute = this.router.url;
        if(currentRoute.includes('/rgpd')){
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
        if (!event.url.includes('/rgpd')) {
          console.log('Saliendo de rgpd, limpiando intervalos');
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
      this.apiService.registerTimeScreen({screenId:28,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`rgpd: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:28,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`rgpd: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('rgpd: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }


}
