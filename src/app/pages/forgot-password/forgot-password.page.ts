import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController,NavController, Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  form: FormGroup;
  email: any;

  isAndroid: boolean = false;
  isIOS: boolean = false;


  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------
  isChargeLoading:boolean=false;

  constructor(
    private modalCtrl: ModalController,
    private utilities: UtilitiesService,
    private navCtrl: NavController,
    private translate: TranslateService,
    private apiService: ApiService, 
    private api: ApiService,private platform: Platform,private router: Router,//SEGUIMIENTO DE TIEMPO
    ) {
      this.isIOS=this.platform.is('ios');
      this.isAndroid=this.platform.is('android');
  }


  /**
   * Inicializamos el formulario
   */
   public ngOnInit(): void {
     
    this.form = new FormGroup({
     
      email: new FormControl('', 
        {validators: [Validators.required, Validators.email]}
      ),
    });
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
    
  }
  
  /**
     * Cerrar el modal
     */
   public closeModal(): void {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }  
  
  /**
     * Enviar la contraseña al servidor
     */
   async submitForm() {

    if(this.form.get('email')?.valid){//email
      console.log(this.form.value);
      //this.utilities.showLoading();
      this.isChargeLoading=true;
      this.api.forgotPassword({email: this.form.value.email, language : this.translate.currentLang ? this.translate.currentLang : 'en' }).subscribe(async response => {
        console.log(response);
        const toastMensaje = await this.translate.get("forgot-password.¡Se ha enviado el email correctamente!").toPromise();
        this.utilities.showToast(toastMensaje); 
        //this.utilities.dismissLoading();
        this.isChargeLoading=false;
        this.navCtrl.pop()

      }, async error => {
        console.log(error);
        const toastMensaje = await this.translate.get("forgot-password.Error al enviar el email").toPromise();
        this.utilities.showToast(toastMensaje); 
        //this.utilities.dismissLoading();
        this.isChargeLoading=true;
      });
    }
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
      console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
      //this.startInterval();
    }
    else{
      //this.clearInterval();

    }
    
  });

  this.routerSubscription = this.router.events.subscribe((event) => {
    if (event instanceof NavigationEnd) {
      // Verifica si la ruta actual no es '/UserSearch'
      if (!event.url.includes('/forgot-password')) {
       // console.log('Saliendo de forgot-password, limpiando intervalos');
        //this.clearInterval();
      }
      else{
        //this.startInterval();
      }
    }
  });

 

  if(this.interval==null){
    //this.startInterval();
  }


}


ionViewWillLeave() {
  console.log("Se ejecuta ionViewWillLeave");
  //this.clearInterval();
}


ngOnDestroy() {
  //this.clearInterval();
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
    this.apiService.registerTimeScreen({screenId:43,screenTime:this.countSeg}).subscribe((result) => {
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
    console.log(`forgot-password: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
    console.log(this.countSeg);

    //ENVIO TIEMPO
    this.apiService.registerTimeScreen({screenId:43,screenTime:this.countSeg}).subscribe((result) => {
      console.log('DATOS',result);
      
    }, error => {
      
      console.log(error);
    });

    //this.clearInterval();
    return;
  }

 

 
  if (this.isActive2) {
    const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
    this.countSeg=this.countSeg+differenceInSeconds;
    console.log(`forgot-password: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
    console.log(this.countSeg);


  } 
  else {
    console.log('forgot-password: No hay fecha anterior, usando la actual como inicial.');
  }

  
  this.previousDate = currentDate;
}



}
