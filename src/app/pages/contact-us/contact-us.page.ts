import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ModalController, AlertController, NavController, Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';


import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

//--

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
})
export class ContactUsPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;

  public language_code:string='en';
  contenidoTextarea: string = '';
  public name:string='';
  public surname:string='';
  public surname2:string='';
  public valorSeleccionado: string='soporte';
  public email:string='';


  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------
  isChargeLoading:boolean=false;

  constructor(
    public auth: AuthenticationService, 
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private alertController: AlertController,
    private router: Router,
    private platform: Platform,
    private translate: TranslateService,
    private modalCtrl: ModalController,
    
    private navCtrl: NavController,
    
    
   
   ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

   

  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    console.log(this.translate.langs.length);
  
    console.log(this.translate.langs.length);
    
      if (this.translate.langs.length == 0) {
        console.log("No idioma");
    
        this.utilities.saveLang('en');
      }
      else{
        const currentLang = this.translate.currentLang;
        console.log("Idioma actual:", currentLang);
        this.language_code=currentLang;
        //this.form.patchValue({ language_code: currentLang });
        
       
      }
  }

  goBack(){
    this.navCtrl.pop();

  }


  
  
  

  onSelectChange(event: any) {
    this.valorSeleccionado = event.detail.value;
    console.log("Valor seleccionado:", this.valorSeleccionado);
  }
  
    onTextareaInput() {
      console.log(this.contenidoTextarea);
      // Puedes realizar cualquier otra lógica aquí si es necesario
    }
  
    async enviarSolicitud(){
  
      if((this.contenidoTextarea && this.contenidoTextarea.trim() !== '') || (this.surname && this.surname.trim() !== '') || (this.surname2 && this.surname2.trim() !== '') || (this.name && this.name.trim() !== '') ){
       // this.utilities.showLoading('');
        this.isChargeLoading=true;
        this.apiService.sendCreateContactEmail({email:this.email,motive:this.valorSeleccionado,message:this.contenidoTextarea,name:this.name,surname:this.surname,surname2:this.surname2,language_code:this.language_code}).subscribe(async (result) => {
          console.log('DATOS',result);

          if(result.status=='MAILSENDED'){
          
            const toastMensaje = await this.translate.get("contact-us.Solicitud de contacto creada con éxito").toPromise();
            //this.utilities.dismissLoading();
            this.isChargeLoading=false;
            this.utilities.showToast(toastMensaje); 
           
            
          }
          else if(result.status === 'WITHOUTSUB' || result.status === 'SUBNOVALID'){
            
           // this.utilities.dismissLoading();
           this.isChargeLoading=false;
            this.abrirModalInvitado();
          }
        
  
        }, async error => {
          this.isChargeLoading=false;
          //this.utilities.dismissLoading();
          const toastMensaje = await this.translate.get("contact-us.Hubo un problema al enviar la solicitud de contacto").toPromise();
          this.utilities.showToast(toastMensaje);
          console.log(error);
        })
  
      }
      else{
        const toastMensaje = await this.translate.get("contact-us.Rellene todos los campos para enviar la solicitud de contacto").toPromise();
        this.utilities.showToast(toastMensaje);
        
      }
    }











    ionViewWillEnter() {
      console.log("SE EJECUTA ionViewWillEnter");
  
      App.addListener('appStateChange', (state) => {
        console.log("se lanza evento ACTIVO/INACTIVO");
        const currentRoute = this.router.url;
        console.log("Ruta actual:", currentRoute);
        this.isActive2=state.isActive;
        if(this.isActive2){

          if(currentRoute.includes('/contact-us')){
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
          if (!event.url.includes('/contact-us')) {
           // console.log('Saliendo de contact-us, limpiando intervalos');
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
    
     // App.removeAllListeners(); // Elimina todos los listeners de App
    
      if (this.interval) {
  
        //ENVIO TIEMPO
        this.apiService.registerTimeScreen({screenId:26,screenTime:this.countSeg}).subscribe((result) => {
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
        console.log(`contact-us: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
        console.log(this.countSeg);
  
        //ENVIO TIEMPO
        this.apiService.registerTimeScreen({screenId:26,screenTime:this.countSeg}).subscribe((result) => {
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
        console.log(`contact-us: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
        console.log(this.countSeg);
  
  
      } 
      else {
        console.log('contact-us: No hay fecha anterior, usando la actual como inicial.');
      }
  
      
      this.previousDate = currentDate;
    }
  
    

    async abrirModalInvitado(){

      const toastMensaje1 = await this.translate.get("contact-us.Adquiera plan válido").toPromise();
      const toastMensaje2 = await this.translate.get("contact-us.Adquiera el PlanS ó el Plan360 para poder ponerse en contacto con el equipo de Insitu").toPromise();



     // let titleText=this.translate.instant('Adquiera plan válido');
     // let infoText=this.translate.instant('Adquiera el PlanS ó el Plan360 para poder ponerse en contacto con el equipo de Insitu');
  
      const modal = await this.modalCtrl.create({
        component: InvitadoModalPage,
        cssClass: 'InvitadoMensajeModal',
        componentProps: {
         title:toastMensaje1,
         info:toastMensaje2,
         showButton:true
          
        },
       // backdropDismiss:false
      });

      modal.onDidDismiss().then((data) => {
       
       console.log(data);
       let noBack = (data.data?.noBack); 
       console.log('HAY QUE VOLVER ATRAS',noBack);
       if(!noBack){
        this.navCtrl.pop();
       }

    
      });

      return await modal.present();
    }
  

}
