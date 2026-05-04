import { Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl  } from '@angular/forms';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ban-users',
  templateUrl: './ban-users.page.html',
  styleUrls: ['./ban-users.page.scss'],
})
export class BanUsersPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;
  
  public language_code:string='en'; 
  public users:any=[];


  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  public toastMensaje1:any='';
  public toastMensaje2:any='';
  public toastMensaje3:any='';
  constructor(
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private utilities: UtilitiesService,
    private navCtrl: NavController,
    private apiService: ApiService,
    private api: ApiService,
    private platform: Platform,
    private router: Router,//SEGUIMIENTO DE TIEMPO
  ) {
      this.isIOS=this.platform.is('ios');
      this.isAndroid=this.platform.is('android'); 
    }

  ngOnInit() {
  }


  async ionViewDidEnter() {
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
      this.obtainBlockedUsers();
    });
      
    
  


    

    
  }




  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.language_code=language;

    this.toastMensaje1 = this.translate.instant("ban-users.Cancelar");
    this.toastMensaje2 = this.translate.instant("ban-users.Desbloquear");
    this.toastMensaje3 = this.translate.instant("ban-users.¿Desea desbloquear a este usuario?");

  }



  public obtainBlockedUsers(){

   
    
    this.apiService.obtainBlockedUsers({language_code:this.language_code}).subscribe((result) => {
      console.log('DATOS',result);
      this.users=result;

    }, async error => {
     // this.utilities.showToast('Hubo un problema al obtener los ');
      const toastMensaje = await this.translate.get("ban-users.No se pudo obtener el listado de usuarios bloqueados").toPromise();
      this.utilities.showToast(toastMensaje); 
      console.log(error);
    });

  }


  
  goBack(){
    this.navCtrl.pop();
  }


  public async showAlert($user: any) {

    //let valtext=this.translate.instant('¿Desea desbloquear a este usuario?');
    const alert = await this.alertCtrl.create({
      header: '',
      message: this.toastMensaje3,
      buttons: [
        {
          text: this.toastMensaje1,
          role: 'cancel'
        },
        {
          text: this.toastMensaje2,
          handler: () => {
            this.apiService.unlockedUser({ userUnlockedId:$user.id }).subscribe(async (result) => {
      
              console.log("RESULTADO>>>>>>>>>>>"); 
              console.log(result);
              if(result['state']=="USERUNLOCKED"){

                const toastMensaje = await this.translate.get("ban-users.Usuario desbloqueado").toPromise();
                this.utilities.showToast(toastMensaje); 
                
                this.users = this.users.filter(u => u.id !== $user.id);
              }
              else if(result['state']=="NOCOINCIDENCE"){
                const toastMensaje = await this.translate.get("ban-users.El usuario ya no se encuentra bloqueado").toPromise();
                this.utilities.showToast(toastMensaje); 
                this.users = this.users.filter(u => u.id !== $user.id);
    
              }
              else{
                const toastMensaje = await this.translate.get("ban-users.Respuesta desconocida").toPromise();
                this.utilities.showToast(toastMensaje); 
                
              }
    
             }, error => {
              console.log(error);
          });
           
            
          }
        }
      ]
    });

    await alert.present();

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
        if (!event.url.includes('/ban-users')) {
        //  console.log('Saliendo de ban-users, limpiando intervalos');
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
      this.apiService.registerTimeScreen({screenId:25,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`ban-users: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:25,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`ban-users: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('ban-users: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }



}
