import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AlertController, ModalController, NavController, Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';


import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

// import { InAppPurchase2, IAPProduct } from '@awesome-cordova-plugins/in-app-purchase-2/ngx';
import { User } from 'src/app/models/User';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;

  public toastMensaje:string='';
  public toastMensaje1:string='';
  public toastMensaje2:string='';
  public toastMensaje3:string='';
  public toastMensaje4:string='';
  public toastMensaje5:string='';
  public toastMensaje6:string='';
  public toastMensaje7:string='';
  public toastMensaje8:string='';

  user : User;
  showSub = false;
  // public theProduct:IAPProduct=null;



  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  constructor(
    // private iap2:InAppPurchase2,
    public auth: AuthenticationService, 
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private alertController: AlertController,
    private router: Router,
    private platform: Platform,
    private translate: TranslateService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
   ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');


    this.platform.ready().then(() => {


      // console.log('tenguen topa');

      // this.iap2.verbosity = this.iap2.DEBUG;

      // this.iap2.register({
      //   id: 'insicompra123',
      //   type: this.iap2.CONSUMABLE,
      // });

      // this.iap2.refresh();
  

      // console.log('gurre lagan');

      /*this.iap2.when('product')
      .approved((p: IAPProduct) => {
        // Handle the product deliverable
        if (p.id === PRODUCT_PRO_KEY) {
          this.isPro = true;
        } else if (p.id === PRODUCT_GEMS_KEY) {
          this.gems += 100;
        }
        this.ref.detectChanges();

        return p.verify();
      })
      .verified((p: IAPProduct) => p.finish());


    // Specific query for one ID
    this.store.when(PRODUCT_PRO_KEY).owned((p: IAPProduct) => {
      this.isPro = true;
    });


      */


  });

   

  }

  ngOnInit() {

    

    // this.register('insicompra123');

    //   // this.iap2.ready(() => {
    //   //   this.iap2.refresh();
    //     this.theProduct=this.iap2.products[0];
    //     console.log("especial");
    //     console.log(this.theProduct);
    //   // });


      
    //   this.iap2.refresh();


  }

  ionViewDidEnter() {


    /*this.apiService.getSubscriptionInfo().subscribe((result) => {
      console.log('Sub info:');
      console.log(result);
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

      }, error => {
      
        console.log(error);
      });



    this.apiService.generatePDF().subscribe((result) => {
      console.log('factura info:');
      console.log(result);
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

      }, error => {
      
        console.log(error);
      });*/

    console.log(this.translate.langs.length);
    this.apiService.getEntity("user").subscribe((user : User) => {
      console.log(user);
      this.user = user;
      if(user.id != 123){
        this.showSub = true;
      }
    }
    , error => {
      console.log(error);
    });

  
    if (this.translate.langs.length == 0) {
      console.log("No idioma");
  
      this.utilities.saveLang('en');
    }


    this.utilities.getLang().then(async (result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo==null) {
        console.log("No idioma");
        this.utilities.saveLang('en');
  
        
      }
      this.toastMensaje = await this.translate.get("settings.Cerrar sesión").toPromise();
        this.toastMensaje2 = await this.translate.get("settings.¿Estás seguro de querer cerrar sesión?").toPromise();
        this.toastMensaje3 = await this.translate.get("settings.Cancelar").toPromise();
        this.toastMensaje4 = await this.translate.get("settings.Aceptar").toPromise();
        this.toastMensaje5 = await this.translate.get("settings.Advertencia").toPromise();
        this.toastMensaje6 = await this.translate.get("settings.¿Estás seguro de querer eliminar tu cuenta?").toPromise();
        this.toastMensaje7 = await this.translate.get("settings.Cuenta eliminada satisfactoriamente").toPromise();
        this.toastMensaje8 = await this.translate.get("Hubo problemas para borrar la cuenta de usuario").toPromise();
    });


    


  }


  cerrarSesion() {

    this.auth.logout();


    /*this.apiService.userOfline().subscribe((user) => {
      console.log(user);
      this.auth.logout();
    }, error => {

      console.log(error);
    });*/


  }

  // purchase(){
  //   console.log("SE EJECUTA EL PURCHASE");
    
  //   this.iap2.order(this.theProduct).then(p => {
        
  //     console.log('Purchase in progress!');
  //   }, e => {
  //     console.log("No se ha ejecutado bien el order");
  //   });
  // }



  async mostrarAdvertencia() {
    const alert = await this.alertController.create({
      header:this.toastMensaje5,//this.translate.instant('Advertencia'),
      message: this.toastMensaje6,//this.translate.instant('¿Estás seguro de querer eliminar tu cuenta?'),
      cssClass: 'custom-button-class',
      buttons: [
        {
          text: this.toastMensaje3,//this.translate.instant('Cancelar'),
          role: 'cancel',
          cssClass: 'custom-button-class',
          handler: () => {
            console.log('Clic en Cancelar');
          }
        },
        {
          text: this.toastMensaje4,//this.translate.instant('Aceptar'),
          cssClass: 'custom-button-class',
          handler: () => {
            console.log('Clic en Aceptar');
            



            

              this.apiService.deleteUser({}).subscribe((user)=>{
                console.log(user);
                this.utilities.showToast(this.toastMensaje7);

                this.router.navigate(['/cover-page']);
                this.auth.logout();
               
              }, error => {
                this.utilities.showToast(this.toastMensaje8);
                    console.log(error);
                  });
            
            
            

            //this.apiService.deleteEntity("user", this.user.id);
           
          },
          //cssClass: 'custom-button-class' 
        }
      ]
    });

    await alert.present();
  }



  goBack(){
    this.navCtrl.pop();

  }

  goBillingData(){
    this.navCtrl.navigateForward("billing-data");
  }

  goMyBillings(){
    this.navCtrl.navigateForward("my-billings");
  }

  goSelectLanguaje(){

    this.navCtrl.navigateForward("languaje-select", { state: { isFromSettings:true }});
  }

  goToContactUs(){

    this.navCtrl.navigateForward("contact-us");

  }


  // public register($claveproducto) {


  //   this.iap2.register({
  //     id: $claveproducto,
  //     type: this.iap2.CONSUMABLE,
  //   });
  //   this.iap2.refresh();

  //   console.log("REGISTER HECHO");

  // }



















  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
        const currentRoute = this.router.url;
        if(currentRoute.includes('/settings')){
         // console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
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
        if (!event.url.includes('/settings')) {
         // console.log('Saliendo de settings, limpiando intervalos');
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
     // console.log("INTERVAL NULL CREANDO UNO NUEVO-----------------------------------");
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
     // console.log("Suscripción al router cancelada correctamente");
    }

    if (this.interval) {

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:22,screenTime:this.countSeg}).subscribe((result) => {
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
     // console.log(`settings: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
     // console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:22,screenTime:this.countSeg}).subscribe((result) => {
       // console.log('DATOS',result);
        
      }, error => {
        
        console.log(error);
      });

      // this.clearInterval();
      return;
    }

   

   
    if (this.isActive2) {
      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg=this.countSeg+differenceInSeconds;
      //console.log(`settings: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      //console.log(this.countSeg);


    } 
    else {
     // console.log('settings: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }



//      message: this.translate.instant('¿Estás seguro de querer cerrar sesión? Piensa que si cierrar sesión luego tendras que ir al logi y volver a iniciar sesión escribiendo tu correo y contraseña y puede que no te apetezca'),

  async mostrarAlertaCerrarSesion() {


    

    


    const alert = await this.alertController.create({
      header:this.toastMensaje,//this.translate.instant('Cerrar sesión'),
      message: this.toastMensaje2,//this.translate.instant('¿Estás seguro de querer cerrar sesión?'),
      cssClass: 'custom-button-class',
      buttons: [
        {
          text: this.toastMensaje3,//this.translate.instant('Cancelar'),
          role: 'cancel',
          cssClass: 'custom-button-class',
          handler: () => {
            console.log('Clic en Cancelar');
          }
        },
        {
          text: this.toastMensaje4,//this.translate.instant('Aceptar'),
          cssClass: 'custom-button-class',
          handler: () => {
            console.log('Clic en Aceptar');
            this.cerrarSesion();
            this.navCtrl.navigateRoot("cover-page");
            
           
          },
          //cssClass: 'custom-button-class' 
        }
      ]
    });

    await alert.present();
  }



  async abrirModalInvitado(){
  
  
      let titleText=this.translate.instant('Coming soon');
      let infoText=this.translate.instant('En breves habilitaremos esta sección para que puedas disfrutar de su contenido');
  
      const modal = await this.modalCtrl.create({
        component: InvitadoModalPage,
        cssClass: 'InvitadoMensajeModal',
        componentProps: {
        title:titleText,
        info:infoText,
          
          
        },
      // backdropDismiss:false
      });
      return await modal.present();
    }
  

}
