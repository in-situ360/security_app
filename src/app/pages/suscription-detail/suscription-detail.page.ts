import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';


import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-suscription-detail',
  templateUrl: './suscription-detail.page.html',
  styleUrls: ['./suscription-detail.page.scss'],
})
export class SuscriptionDetailPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;

  selectedPlan: string = 'Plan S'; // Plan predeterminado seleccionado

  // Listados de beneficios para cada plan
  planIBenefits: string[] = [
    'suscription-detail.Búsqueda ilimitada',
    'suscription-detail.Completa tu perfil',
    'suscription-detail.Obtén reseñas verificadas',
    'suscription-detail.Forma parte de proyecto'
  ];

  planSBenefits: string[] = [
    'suscription-detail.Incluido lo relativo al plan I',
    'suscription-detail.Contacta con profesionales',
    'suscription-detail.Filtros de búsqueda Premium',
    'suscription-detail.Visualiza todos los perfiles',
    'suscription-detail.Aumenta tu visibilidad',
    'suscription-detail.Métricas avanzadas'
  ];

  plan360Benefits: string[] = [
    'suscription-detail.Incluido lo relativo al plan S',
    'suscription-detail.Crear y administrar proyectos',
    'suscription-detail.Gestiona poderes a tu equipo',
    'suscription-detail.Almacenamiento ilimitado de proyectos',
    'suscription-detail.Creación de chat grupales',
    'suscription-detail.Calendario compartido'
  ];

  currentBenefits: string[] = this.planSBenefits;


  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  constructor(

   
    private platform: Platform,
    private navCtrl: NavController,
    private apiService: ApiService,

    private utilities: UtilitiesService,
    private alertController: AlertController, 
    private router: Router,
    
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter(){  

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');


    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      const currentRoute = this.router.url;
      console.log("Ruta actual:", currentRoute);
      this.isActive2=state.isActive;
      if(this.isActive2){

        if(currentRoute.includes('/suscription-detail')){
          console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
          this.startInterval();
        }
        
      }
      else{
        this.clearInterval();

      }
      
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Verifica si la ruta actual no es '/UserSearch'
        if (!event.url.includes('/suscription-detail')) {
        //  console.log('Saliendo de suscription-detail, limpiando intervalos');
          this.clearInterval();
        }
        else{
          this.startInterval();
        }
      }
    });

   

    if(this.interval==null){
      this.startInterval();
    }
  
  }

  

  selectPlan(plan: string) {
    this.selectedPlan = plan;
    console.log('Plan seleccionado:', this.selectedPlan);
    switch (plan) {
      case 'Plan I':
        this.currentBenefits = this.planIBenefits;
        break;
      case 'Plan S':
        this.currentBenefits = this.planSBenefits;
        break;
      case 'Plan 360':
        this.currentBenefits = this.plan360Benefits;
        break;
      default:
        this.currentBenefits = this.planIBenefits;
    }
  }

  goBack(){
    this.navCtrl.pop();

  }






  ionViewWillLeave() {
    console.log("Se ejecuta ionViewWillLeave");
    this.clearInterval();
  }

  
  ngOnDestroy() {
    this.clearInterval();
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
      this.apiService.registerTimeScreen({screenId:45,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`suscription-detail: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:45,screenTime:this.countSeg}).subscribe((result) => {
        console.log('DATOS',result);
        
      }, error => {
        
        console.log(error);
      });

      this.clearInterval();
      return;
    }

   

   
    if (this.isActive2) {
      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg=this.countSeg+differenceInSeconds;
      console.log(`suscription-detail: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('suscription-detail: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }

  

}
