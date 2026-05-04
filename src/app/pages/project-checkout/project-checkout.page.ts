import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { AlertController, Platform } from '@ionic/angular';
import {ModalController, NavController, NavParams} from '@ionic/angular';
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';
//import { Stripe, PaymentSheetEventsEnum } from '@capacitor-community/stripe';
//import { first } from 'rxjs';


import { Stripe, PaymentSheetEventsEnum,ApplePayEventsEnum, GooglePayEventsEnum, PaymentFlowEventsEnum, } from '@capacitor-community/stripe';
import { first,lastValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE


import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-project-checkout',
  templateUrl: './project-checkout.page.html',
  styleUrls: ['./project-checkout.page.scss'],
})

export class ProjectCheckoutPage {
  selectedPaymentMethod: string=null;
  isTermsAccepted: boolean = false;

  isAndroid: boolean = false;
  isIOS: boolean = false;
  public thePrice:any=10;


  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------


  isModalOpen = false;

  constructor(
    private modalCtrl: ModalController,
    private platform: Platform,
    private navCtrl: NavController,
    private apiService: ApiService,
    private translate: TranslateService,

    private utilities: UtilitiesService,
    private alertController: AlertController, 
    private router: Router,
  ) { }

  
  goBack(){
    this.navCtrl.pop();

  }


  onRadioGroupChange(event: any) {
    this.selectedPaymentMethod = event.detail.value;
    console.log(this.selectedPaymentMethod);
  }

  onCheckboxChange() {
    console.log('Checkbox seleccionado:', this.isTermsAccepted);
  }


  async ionViewWillEnter(){  
    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');


    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      const currentRoute = this.router.url;
      console.log("Ruta actual:", currentRoute);
      this.isActive2=state.isActive;
      if(this.isActive2){

        if(currentRoute.includes('/project-checkout')){
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
        if (!event.url.includes('/project-checkout')) {
          //console.log('Saliendo de project-checkout, limpiando intervalos');
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


    this.apiService.getEntity('project_prices', 1).subscribe(res => {
      console.log(res);
      const data = res.result;
      //this.utilities.showToast(`precio proyecto: ${data.price}`);
      this.thePrice=data.price;
     
    }, error => {
      console.log(error);
    
    })

  }




  async pagar() {

    if(this.selectedPaymentMethod=='apple'){
      this.applePay();

    }
    else if(this.selectedPaymentMethod=='credit' ||  this.selectedPaymentMethod=='paypal'){

        await this.utilities.showLoading(this.translate.instant('project-checkout.Cargando...'));

        // Agrega el evento de PaymentSheet
        Stripe.addListener(PaymentSheetEventsEnum.Completed, () => {
          console.log('PaymentSheetEventsEnum.Completed');
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>0');
        });

        try {
          // ObtÃ©n los datos de pago desde tu backend
          const response = await this.apiService
            .addEntity('pack', {
              packId:-1,
              paymentMethod:this.selectedPaymentMethod,
            })
            .pipe(first())
            .toPromise();
          console.log(response);
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>1');
          const paymentIntentId = response.paymentIntentId;
          const paymentIntent = response.paymentIntent;
          const ephemeralKey = response.ephemeralKey;
          const customer = response.customer;

          // Prepara PaymentSheet con CreatePaymentSheetOption
          await Stripe.createPaymentSheet({
            paymentIntentClientSecret: paymentIntent,
            customerId: customer,
            customerEphemeralKeySecret: ephemeralKey,
            merchantDisplayName: 'Qualifier',
            countryCode: 'ES',
            returnURL: 'insitu3601://payment'
          });
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>2');
          this.utilities.dismissLoading();

          // Presenta PaymentSheet y obtÃ©n el resultado
          const { paymentResult } = await Stripe.presentPaymentSheet();

          console.log('PAYMENT SHEET ', paymentResult);

          if (paymentResult && paymentResult === PaymentSheetEventsEnum.Completed) {
            
            this.apiService.addEntity('procesarPagoStripe', {type: 'PACK'}).subscribe((element) => {
              console.log(element);
              console.log('inicia ');
              this.apiService.incrementProjectCount({}).subscribe((result) => {
                console.log('DATOS', result);

              this.utilities.showToast(this.translate.instant('project-checkout.Pago completado.'));
              this.setOpen(true);
              //this.modalDescript = `El pago de ${this.packSelected.name} se ha realizado correctamente`;

              }, error => {
          
                this.utilities.dismissLoading();
                console.log(error);
                
              });
              console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>3');
              
            }, (error) => {
              console.log(error);
              this.utilities.dismissLoading();
              

            })
            

            
          } else if (
            paymentResult &&
            paymentResult === PaymentSheetEventsEnum.Canceled
          ) {
            this.utilities.showToast(this.translate.instant('project-checkout.Pago cancelado por el usuario.'));
          } else {
            this.utilities.showToast(this.translate.instant('project-checkout.Ocurrió un error durante la transacción de pago'));
          }
        } catch (error) {
          // Manejar el error en caso de problemas con la transacciÃ³n
          this.utilities.showToast(this.translate.instant('project-checkout.Ocurrió un error durante la transacción de pago'));
          console.error(error);
        }

    }
    else{

      console.log("otro");
    }

    

    
  
  }




  async applePay() {


    console.log('1');

    
    const isAvailable = await Stripe.isApplePayAvailable().then((result)=>{
      console.log('Control isApplePayAvailable');
      console.log(result);
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><');
  
    }, (error)=>{
  console.log(error);
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><');
  });  

    
    
    console.log('3');

    // be able to get event of Apple Pay
    Stripe.addListener(ApplePayEventsEnum.Completed, () => {
      console.log('ApplePayEventsEnum.Completed');
      console.log('4');
    });
    
    


    console.log('5');


  


    const response = await this.apiService
          .addEntity('pack', {
            packId:-1,
            paymentMethod:this.selectedPaymentMethod,
          })
          .pipe(first())
          .toPromise();
          console.log('6');
        console.log(response);
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>1');
        const paymentIntentId = response.paymentIntentId;
        const paymentIntent2 = response.paymentIntent;
        const ephemeralKey = response.ephemeralKey;
        const customer = response.customer;




    // Prepare Apple Pay
    await Stripe.createApplePay({
      paymentIntentClientSecret: paymentIntent2,
      paymentSummaryItems: [{
        label: 'INSITU',//'Packs',
        amount:/*12.99*/this.thePrice*1// 0.01
      }],
      merchantIdentifier: 'merchant.com.xerintel.insitu3601',
      countryCode: 'ES',  // Código de país para España
      currency: 'EUR',    // Moneda en euros
    });

    // Present Apple Pay
    const result = await Stripe.presentApplePay();
    if(result.paymentResult === ApplePayEventsEnum.Failed){
      this.utilities.showToast(this.translate.instant('project-checkout.No se pudo realizar el pago.'));
    }
    else if(result.paymentResult === ApplePayEventsEnum.Canceled){
      this.utilities.showToast(this.translate.instant('project-checkout.Pago cancelado.'));
    }
    else if (result.paymentResult === ApplePayEventsEnum.Completed) {
      // Happy path
      console.log('HASTA AQUI GENIAL');


      //INCREMENTO EL Nº DE PROYECTOS

      this.apiService.incrementProjectCount({}).subscribe((result) => {
        console.log('DATOS', result);

        this.setOpen(true);

        this.utilities.showToast(this.translate.instant('project-checkout.Pago completado.'));
        
        this.utilities.dismissLoading();
      }, error => {
        
        this.utilities.dismissLoading();
        console.log(error);
        
      });


      
          // this.setOpen(true);
            //this.modalDescript = `El pago de ${this.packSelected.name} se ha realizado correctamente`;
    
    }
  }




  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }


  activame($modal) {
    console.log('se activo!');
    $modal.dismiss();
    this.isModalOpen = false;
    this.goBack();
    //this.navCtrl.navigateRoot('tabs/profile');

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
      this.apiService.registerTimeScreen({screenId:46,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`project-checkout: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:46,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`project-checkout: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('project-checkout: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }





}

