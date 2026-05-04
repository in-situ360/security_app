import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgModel } from '@angular/forms'; // Importa NgModel
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { AlertController, Platform } from '@ionic/angular';
import {ModalController, NavController, NavParams} from '@ionic/angular';
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';
import { Stripe, PaymentSheetEventsEnum,ApplePayEventsEnum, GooglePayEventsEnum, PaymentFlowEventsEnum, } from '@capacitor-community/stripe';
import { first,lastValueFrom } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';

import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE


import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { ModalBillingDataPage } from '../modal-billing-data/modal-billing-data.page';
import { UserBillingData } from 'src/app/models/UserBillingData';

@Component({
  selector: 'app-suscription-checkout',
  templateUrl: './suscription-checkout.page.html',
  styleUrls: ['./suscription-checkout.page.scss'],
})

  export class SuscriptionCheckoutPage {
    selectedPaymentMethod: string=null;
    isTermsAccepted: boolean = false;

    public suscriptionSelected:any=null;
    public reg:any=null;

    isAndroid: boolean = false;
    isIOS: boolean = false;

    //SEGUIMIENTO DE TIEMPO
    private interval: any=null;;
    private countSeg:number;
    private previousDate: Date | null = null;
    private isActive2:boolean=true;
    private routerSubscription: Subscription;
    //-----------------------------------------

    isModalOpen = false;
    billingDataExist:boolean=false;
    usingBillingData:boolean=false;


   /* // Mapeo de regiones a monedas (ISO 4217)
    public currencyMap: { [key: string]: string } = {
      'ES': 'EUR', // España → Euro
      'FR': 'EUR', // Francia → Euro
      'US': 'USD', // EE.UU. → Dólar
      'GB': 'GBP', // Reino Unido → Libra
      'MX': 'MXN', // México → Peso mexicano
      'JP': 'JPY', // Japón → Yen
    };
    public country='ES';
    public currency='EUR';*/
  
    constructor(
      private platform: Platform,
      private alertCtrl: AlertController,
      private modalCtrl: ModalController,
      private translate: TranslateService,
      private navCtrl: NavController,
      public auth: AuthenticationService,
      private apiService: ApiService, 
      private utilities: UtilitiesService,
      private alertController: AlertController, 
      private router: Router,
      private cdr: ChangeDetectorRef

    ) { 

     this.suscriptionSelected=history.state.suscriptionSelected;
     this.reg=history.state.reg;
     
    }
  
    onRadioGroupChange(event: any) {
      this.selectedPaymentMethod = event.detail.value;
      console.log(this.selectedPaymentMethod);
    }

    onCheckboxChange() {
      console.log('Checkbox seleccionado:', this.isTermsAccepted);
    }

    onBillingDataCheckboxChange() {
      console.log('Checkbox billing data seleccionado:', this.usingBillingData);
      
      // Si se intenta activar pero no existen datos de facturación
      if (this.usingBillingData && !this.billingDataExist) {
        console.log('No existen datos de facturación, abriendo modal...');
        this.abrirModalBillingData();
        // Resetear el checkbox hasta que se creen los datos
        // Usar setTimeout para asegurar que se actualice el binding
        setTimeout(() => {
          this.usingBillingData = false;
          this.cdr.detectChanges(); // Forzar detección de cambios
        }, 100);
      }
    }



    async ionViewWillEnter(){  
      this.isIOS=this.platform.is('ios');
      this.isAndroid=this.platform.is('android');
  
  
      console.log("SE EJECUTA ionViewWillEnter");

     /* const locale = new Intl.DateTimeFormat().resolvedOptions().locale;
      this.country = locale.includes('-') ? locale.split('-')[1] : 'ES'; 
      this.currency = this.currencyMap[this.country] || 'EUR';*/


      this.apiService.getEntity('UserBillingData').subscribe(
      (userBillingData: UserBillingData) => {
        console.log('BillingData:',userBillingData);
        
        // Verificar si la respuesta contiene un error específico
        if (userBillingData && userBillingData.error === 'Datos de usuario no encontrado') {
          console.log('Datos de usuario no encontrados, abriendo modal...');
          //this.abrirModalBillingData();
          this.billingDataExist=false;
        } else {
          this.billingDataExist=true;
          if(this.billingDataExist){
            this.usingBillingData=true;

          }
          // Al inicializar el formulario, cargar los datos del usuario
         // this.abrirModalBillingData();
        }
        
      },
      async error => {
        const toastMensaje = await this.translate.get("profile-settings.Error obteniendo el usuario").toPromise();
        console.log(toastMensaje);
        // También abrir el modal en caso de error
       // this.abrirModalBillingData();
      }
    );

      App.addListener('appStateChange', (state) => {
        console.log("se lanza evento ACTIVO/INACTIVO");
        const currentRoute = this.router.url;
        console.log("Ruta actual:", currentRoute);
        this.isActive2=state.isActive;
        if(this.isActive2){
  
          if(currentRoute.includes('/suscription-checkout')){
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
          if (!event.url.includes('/suscription-checkout')) {
          //  console.log('Saliendo de suscription-checkout, limpiando intervalos');
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


    goBack(){
      this.navCtrl.pop();
  
    }




    async pagar() {




       this.apiService.getEntity('UserBillingData').subscribe(
      (userBillingData: UserBillingData) => {
        console.log('BillingData:',userBillingData);
        
        // Verificar si la respuesta contiene un error específico
        if (userBillingData && userBillingData.error === 'Datos de usuario no encontrado') {
          console.log('Datos de usuario no encontrados, abriendo modal...');
          this.billingDataExist=false;
          this.abrirModalBillingData();
          
          return;
        } 
        else{

           if(this.selectedPaymentMethod=='apple'){
              this.applePay2();
            }
            else if(this.selectedPaymentMethod=='credit' ||  this.selectedPaymentMethod=='paypal'){

              this.processStripeSubscription2();
            

            }
            else{

              console.log(this.selectedPaymentMethod);
            }


        }
        
      },
      async error => {
        const toastMensaje = await this.translate.get("profile-settings.Error obteniendo el usuario").toPromise();
        console.log(toastMensaje);
        // También abrir el modal en caso de error
       return;
      }
    );



     
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
        this.apiService.registerTimeScreen({screenId:47,screenTime:this.countSeg}).subscribe((result) => {
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
        console.log(`suscription-checkout: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
        console.log(this.countSeg);
  
        //ENVIO TIEMPO
        this.apiService.registerTimeScreen({screenId:47,screenTime:this.countSeg}).subscribe((result) => {
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
        console.log(`suscription-checkout: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
        console.log(this.countSeg);
  
  
      } 
      else {
        console.log('suscription-checkout: No hay fecha anterior, usando la actual como inicial.');
      }
  
      
      this.previousDate = currentDate;
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
      
  


      async processStripeSubscription2() {
        try {
            await this.utilities.showLoading(this.translate.instant('suscription-checkout.Cargando...'));
    
            // Obtener los datos de Stripe desde el backend
            const response = await this.apiService
                .addEntity('stripe', {
                    subId: this.suscriptionSelected.id,
                    paymentMethod: this.selectedPaymentMethod,
                    reg:this.reg,
                })
                .pipe(first())
                .toPromise();
    
            console.log('Respuesta de Stripe:', response);
    
            const { 
                paymentIntent, 
                setupIntentClientSecret,
                ephemeralKey, 
                customer, 
                publishableKey, 
                trial_end, 
                isTrial 
            } = response;
    
            // Si hay un período de prueba
            if (isTrial) {
                console.log('La suscripción tiene un período de prueba activo.');
                const trialDate = new Date(trial_end * 1000).toLocaleDateString();
    
                this.apiService.addEntity('procesarPagoStripe', { type: 'SUBSCRIPTION',reg:this.reg })
                    .subscribe(() => {
                        this.utilities.showToast(this.translate.instant('suscription-checkout.Suscripción de prueba activa. Finalizará el ') + trialDate + '.');
                        this.setOpen(true);
                    }, (error) => {
                        console.error(' Error al procesar la suscripción:', error);
                        this.utilities.dismissLoading();
                    });
    
                this.utilities.dismissLoading();
                return;
            }
    
            //  Si hay un SetupIntent, solicitar tarjeta
            if (setupIntentClientSecret) {
                console.log(' Se requiere ingresar un método de pago (SetupIntent)');
    
                await Stripe.createPaymentSheet({
                    setupIntentClientSecret,
                    customerId: customer,
                    customerEphemeralKeySecret: ephemeralKey,
                    merchantDisplayName: 'Qualifier',
                    countryCode: 'ES', // Opcional: fuerza España como país del pago.
                    returnURL: 'insitu3601://payment'
                });
    
                const { paymentResult } = await Stripe.presentPaymentSheet();
    
                if (paymentResult === PaymentSheetEventsEnum.Completed) {
                    console.log(' Método de pago agregado correctamente.');
                    this.utilities.showToast(this.translate.instant('suscription-checkout.Método de pago agregado correctamente.'));
                } else {
                    console.warn(' El cliente canceló el ingreso del método de pago.');
                    this.utilities.showToast(this.translate.instant('suscription-checkout.Ingreso de método de pago cancelado.'));
                    this.utilities.dismissLoading();
                    return;
                }
            }
    
            // Si hay un PaymentIntent, proceder con la suscripción
            if (paymentIntent) {
                console.log(' Procediendo con PaymentIntent para la suscripción.');
    
                await Stripe.createPaymentSheet({
                    paymentIntentClientSecret: paymentIntent,
                    customerId: customer,
                    customerEphemeralKeySecret: ephemeralKey,
                    merchantDisplayName: 'Qualifier',
                    countryCode: 'ES', // Opcional: fuerza España como país del pago.
                    returnURL: 'insitu3601://payment'
                });
    
                const { paymentResult } = await Stripe.presentPaymentSheet();
    
                if (paymentResult === PaymentSheetEventsEnum.Completed) {
                    console.log(' Pago completado correctamente.');
    
                    this.apiService.addEntity('procesarPagoStripe', { type: 'SUBSCRIPTION',reg:this.reg })
                        .subscribe(() => {
                            this.utilities.showToast(this.translate.instant('suscription-checkout.Pago completado correctamente.'));
                            this.setOpen(true);
                        }, (error) => {
                            console.error(' Error al procesar la suscripción:', error);
                            this.utilities.dismissLoading();
                        });
                } else if (paymentResult === PaymentSheetEventsEnum.Canceled) {
                    this.utilities.showToast(this.translate.instant('suscription-checkout.Pago cancelado por el usuario.'));
                } else {
                    this.utilities.showToast(this.translate.instant('suscription-checkout.Error durante el proceso de pago.'));
                }
            }
    
        } catch (error) {
            console.error(' Error en la suscripción de Stripe:', error);
            this.utilities.showToast(this.translate.instant('suscription-checkout.Ocurrió un error durante el proceso de suscripción.'));
        } finally {
            this.utilities.dismissLoading();
        }
    }
    












      async applePay2() {
        try {
            await this.utilities.showLoading('Cargando...');
    
            // Verificar si Apple Pay está disponible
            const isAvailable = await Stripe.isApplePayAvailable().then((result)=>{
              console.log('Control isApplePayAvailable');
              console.log(result);
              console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><');
          
            }, (error)=>{
            console.log(error);
              console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><');
          });  
    
            // Escuchar eventos de Apple Pay
            Stripe.addListener(ApplePayEventsEnum.Completed, () => {
                console.log('✅ ApplePayEventsEnum.Completed');
            });

            console.log('>>>>>>>>>>>>>>>APPLEPAY REGION:',this.reg);
            console.log('>>>>>>>>>>>>>>>APPLEPAY paymentMethod:',this.selectedPaymentMethod);
            console.log('>>>>>>>>>>>>>>>APPLEPAY SUB ID:',this.suscriptionSelected.id);
    
            // Obtener los datos de Stripe desde el backend
            const response = await this.apiService
                .addEntity('stripe', {
                    subId: this.suscriptionSelected.id,
                    paymentMethod: this.selectedPaymentMethod,
                    reg:this.reg,
                })
                .pipe(first())
                .toPromise();
    
            console.log('Respuesta de Stripe:', response);
    
            const { 
                paymentIntent, 
                ephemeralKey, 
                customer, 
                trial_end, 
                isTrial 
            } = response;
    
            if (isTrial) {
                console.log('La suscripción tiene un período de prueba activo.');
                const trialDate = new Date(trial_end * 1000).toLocaleDateString();

                this.apiService.addEntity('procesarPagoStripe', { type: 'SUBSCRIPTION',reg:this.reg })
                    .subscribe(() => {
                      this.utilities.showToast(this.translate.instant('suscription-checkout.Suscripción de prueba activa. Finalizará después del ') + trialDate + '.');

                        this.setOpen(true);
                    }, (error) => {
                        console.error('Error al procesar el pago:', error);
                        this.utilities.dismissLoading();
                        this.utilities.showToast(this.translate.instant('suscription-checkout.Error al procesar la suscripción.'));
                    });

                this.utilities.dismissLoading();
                return;
            }
    
            if (!paymentIntent) {
                console.error('No se recibió paymentIntentClientSecret');
                this.utilities.showToast(this.translate.instant('suscription-checkout.Error al configurar el pago con Apple Pay.'));
                this.utilities.dismissLoading();
                return;
            }
    
            // Preparar Apple Pay
            await Stripe.createApplePay({
                paymentIntentClientSecret: paymentIntent,
                paymentSummaryItems: [{
                    label: 'INSITU',
                    amount: (this.suscriptionSelected?.countrySub ? this.suscriptionSelected?.countrySub?.price : this.suscriptionSelected?.price) * 1,
                }],
                merchantIdentifier: 'merchant.com.xerintel.insitu3601',
                countryCode: this.reg,//'ES',
                currency: this.suscriptionSelected?.countrySub ? this.getCurrencyCode(this.reg) : 'EUR',
            });
    
            // Presentar Apple Pay
            const result = await Stripe.presentApplePay();
    
            if (result.paymentResult === ApplePayEventsEnum.Failed) {
                this.utilities.showToast(this.translate.instant('suscription-checkout.No se pudo realizar el pago con Apple Pay.'));
            } else if (result.paymentResult === ApplePayEventsEnum.Canceled) {
                this.utilities.showToast(this.translate.instant('suscription-checkout.Pago cancelado por el usuario.'));
            } else if (result.paymentResult === ApplePayEventsEnum.Completed) {
                console.log('Pago completado correctamente con Apple Pay.');
    
                this.apiService.addEntity('procesarPagoStripe', { type: 'SUBSCRIPTION',reg:this.reg })
                    .subscribe(() => {
                        this.utilities.showToast(this.translate.instant('suscription-checkout.Pago completado correctamente.'));
                        this.setOpen(true);
                    }, (error) => {
                        console.error('Error al procesar el pago:', error);
                        this.utilities.dismissLoading();
                        this.utilities.showToast(this.translate.instant('suscription-checkout.Error al procesar la suscripción.'));
                    });
            }
        } catch (error) {
            console.error('Error en Apple Pay:', error);
            this.utilities.showToast(this.translate.instant('suscription-checkout.Ocurrió un error durante el proceso de pago con Apple Pay.'));
        } finally {
            this.utilities.dismissLoading();
        }
    }



    currencySymbol(countryCode: string | null): string {
      return this.currencyMap[countryCode] || '€'; // Si no encuentra, usa €
    }
    getCurrencySymbol(countryCode: string): string {
      return this.currencyMap[countryCode] || '€'; // Retorna '€' si el código del país no existe
  }
    private currencyMap: { [key: string]: string } = {
      "AF": "؋",
      "AL": "L",
      "DZ": "دج",
      "AS": "$",
      "AD": "€",
      "AO": "Kz",
      "AI": "$",
      "AG": "$",
      "AR": "$",
      "AM": "֏",
      "AW": "ƒ",
      "AU": "$",
      "AT": "€",
      "AZ": "₼",
      "BS": "$",
      "BH": "د.ب",
      "BD": "৳",
      "BB": "$",
      "BY": "Br",
      "BE": "€",
      "BZ": "$",
      "BJ": "CFA",
      "BM": "$",
      "BT": "Nu.",
      "BO": "Bs.",
      "BA": "KM",
      "BW": "P",
      "BR": "R$",
      "BN": "$",
      "BG": "лв",
      "BF": "CFA",
      "BI": "FBu",
      "KH": "៛",
      "CM": "CFA",
      "CA": "$",
      "CV": "CVE",
      "KY": "$",
      "CF": "CFA",
      "TD": "CFA",
      "CL": "$",
      "CN": "¥",
      "CO": "$",
      "KM": "CF",
      "CG": "CFA",
      "CR": "₡",
      "HR": "kn",
      "CU": "$",
      "CY": "€",
      "CZ": "Kč",
      "DK": "kr",
      "DJ": "Fdj",
      "DM": "$",
      "DO": "RD$",
      "EC": "$",
      "EG": "£",
      "SV": "$",
      "GQ": "CFA",
      "ER": "Nfk",
      "EE": "€",
      "ET": "Br",
      "FJ": "$",
      "FI": "€",
      "FR": "€",
      "GA": "CFA",
      "GM": "D",
      "GE": "₾",
      "DE": "€",
      "GH": "GH₵",
      "GR": "€",
      "GD": "$",
      "GT": "Q",
      "GN": "GNF",
      "GY": "$",
      "HT": "G",
      "HN": "L",
      "HK": "$",
      "HU": "Ft",
      "IS": "kr",
      "IN": "₹",
      "ID": "Rp",
      "IR": "﷼",
      "IQ": "ع.د",
      "IE": "€",
      "IL": "₪",
      "IT": "€",
      "CI": "CFA",
      "JM": "$",
      "JP": "¥",
      "JO": "د.ا",
      "KZ": "₸",
      "KE": "KSh",
      "KW": "د.ك",
      "KG": "с",
      "LA": "₭",
      "LV": "€",
      "LB": "ل.ل",
      "LS": "L",
      "LR": "$",
      "LY": "ل.د",
      "LI": "CHF",
      "LT": "€",
      "LU": "€",
      "MO": "P",
      "MG": "Ar",
      "MW": "MK",
      "MY": "RM",
      "MV": "Rf",
      "ML": "CFA",
      "MT": "€",
      "MH": "$",
      "MR": "أ.م",
      "MU": "₨",
      "MX": "$",
      "FM": "$",
      "MD": "L",
      "MC": "€",
      "MN": "₮",
      "ME": "€",
      "MA": "د.م.",
      "MZ": "MT",
      "MM": "K",
      "NA": "$",
      "NP": "₨",
      "NL": "€",
      "NZ": "$",
      "NI": "C$",
      "NE": "CFA",
      "NG": "₦",
      "KP": "₩",
      "MK": "ден",
      "NO": "kr",
      "OM": "ر.ع.",
      "PK": "₨",
      "PW": "$",
      "PA": "B/.",
      "PG": "K",
      "PY": "₲",
      "PE": "S/",
      "PH": "₱",
      "PL": "zł",
      "PT": "€",
      "QA": "ر.ق",
      "RO": "lei",
      "RU": "₽",
      "RW": "R₣",
      "WS": "T",
      "SA": "ر.س",
      "SN": "CFA",
      "RS": "дин.",
      "SC": "₨",
      "SG": "$",
      "SK": "€",
      "SI": "€",
      "SB": "$",
      "SO": "Sh",
      "ZA": "R",
      "KR": "₩",
      "LK": "Rs",
      "SD": "ج.س.",
      "SR": "$",
      "SE": "kr",
      "CH": "CHF",
      "SY": "£",
      "TW": "NT$",
      "TJ": "ЅМ",
      "TZ": "TSh",
      "TH": "฿",
      "TL": "$",
      "TG": "CFA",
      "TO": "T$",
      "TN": "د.ت",
      "TR": "₺",
      "TM": "m",
      "UG": "USh",
      "UA": "₴",
      "AE": "د.إ",
      "GB": "£",
      "US": "$",
      "UY": "$U",
      "UZ": "so’m",
      "VU": "VT",
      "VE": "Bs.S",
      "VN": "₫",
      "YE": "﷼",
      "ZM": "ZK",
      "ZW": "$"
  };



  getCurrencyCode(countryCode: string): string {
    const currencyMap: { [key: string]: string } = {
        "AF": "AFN",
        "AL": "ALL",
        "DZ": "DZD",
        "AS": "USD",
        "AD": "EUR",
        "AO": "AOA",
        "AI": "XCD",
        "AG": "XCD",
        "AR": "ARS",
        "AM": "AMD",
        "AW": "AWG",
        "AU": "AUD",
        "AT": "EUR",
        "AZ": "AZN",
        "BS": "BSD",
        "BH": "BHD",
        "BD": "BDT",
        "BB": "BBD",
        "BY": "BYN",
        "BE": "EUR",
        "BZ": "BZD",
        "BJ": "XOF",
        "BM": "BMD",
        "BT": "BTN",
        "BO": "BOB",
        "BA": "BAM",
        "BW": "BWP",
        "BR": "BRL",
        "BN": "BND",
        "BG": "BGN",
        "BF": "XOF",
        "BI": "BIF",
        "KH": "KHR",
        "CM": "XAF",
        "CA": "CAD",
        "CV": "CVE",
        "KY": "KYD",
        "CF": "XAF",
        "TD": "XAF",
        "CL": "CLP",
        "CN": "CNY",
        "CO": "COP",
        "KM": "KMF",
        "CG": "XAF",
        "CR": "CRC",
        "HR": "HRK",
        "CU": "CUP",
        "CY": "EUR",
        "CZ": "CZK",
        "DK": "DKK",
        "DJ": "DJF",
        "DM": "XCD",
        "DO": "DOP",
        "EC": "USD",
        "EG": "EGP",
        "SV": "USD",
        "GQ": "XAF",
        "ER": "ERN",
        "EE": "EUR",
        "ET": "ETB",
        "FJ": "FJD",
        "FI": "EUR",
        "FR": "EUR",
        "GA": "XAF",
        "GM": "GMD",
        "GE": "GEL",
        "DE": "EUR",
        "GH": "GHS",
        "GR": "EUR",
        "GD": "XCD",
        "GT": "GTQ",
        "GN": "GNF",
        "GY": "GYD",
        "HT": "HTG",
        "HN": "HNL",
        "HK": "HKD",
        "HU": "HUF",
        "IS": "ISK",
        "IN": "INR",
        "ID": "IDR",
        "IR": "IRR",
        "IQ": "IQD",
        "IE": "EUR",
        "IL": "ILS",
        "IT": "EUR",
        "CI": "XOF",
        "JM": "JMD",
        "JP": "JPY",
        "JO": "JOD",
        "KZ": "KZT",
        "KE": "KES",
        "KW": "KWD",
        "KG": "KGS",
        "LA": "LAK",
        "LV": "EUR",
        "LB": "LBP",
        "LS": "LSL",
        "LR": "LRD",
        "LY": "LYD",
        "LI": "CHF",
        "LT": "EUR",
        "LU": "EUR",
        "MO": "MOP",
        "MG": "MGA",
        "MW": "MWK",
        "MY": "MYR",
        "MV": "MVR",
        "ML": "XOF",
        "MT": "EUR",
        "MH": "USD",
        "MR": "MRU",
        "MU": "MUR",
        "MX": "MXN",
        "FM": "USD",
        "MD": "MDL",
        "MC": "EUR",
        "MN": "MNT",
        "ME": "EUR",
        "MA": "MAD",
        "MZ": "MZN",
        "MM": "MMK",
        "NA": "NAD",
        "NP": "NPR",
        "NL": "EUR",
        "NZ": "NZD",
        "NI": "NIO",
        "NE": "XOF",
        "NG": "NGN",
        "KP": "KPW",
        "MK": "MKD",
        "NO": "NOK",
        "OM": "OMR",
        "PK": "PKR",
        "PW": "USD",
        "PA": "PAB",
        "PG": "PGK",
        "PY": "PYG",
        "PE": "PEN",
        "PH": "PHP",
        "PL": "PLN",
        "PT": "EUR",
        "QA": "QAR",
        "RO": "RON",
        "RU": "RUB",
        "RW": "RWF",
        "WS": "WST",
        "SA": "SAR",
        "SN": "XOF",
        "RS": "RSD",
        "SC": "SCR",
        "SG": "SGD",
        "SK": "EUR",
        "SI": "EUR",
        "SB": "SBD",
        "SO": "SOS",
        "ZA": "ZAR",
        "KR": "KRW",
        "LK": "LKR",
        "SD": "SDG",
        "SR": "SRD",
        "SE": "SEK",
        "CH": "CHF",
        "SY": "SYP",
        "TW": "TWD",
        "TJ": "TJS",
        "TZ": "TZS",
        "TH": "THB",
        "TL": "USD",
        "TG": "XOF",
        "TO": "TOP",
        "TN": "TND",
        "TR": "TRY",
        "TM": "TMT",
        "UG": "UGX",
        "UA": "UAH",
        "AE": "AED",
        "GB": "GBP",
        "US": "USD",
        "UY": "UYU",
        "UZ": "UZS",
        "VU": "VUV",
        "VE": "VES",
        "VN": "VND",
        "YE": "YER",
        "ZM": "ZMW",
        "ZW": "ZWL"
    };
    return currencyMap[countryCode] || 'EUR'; // Si no se encuentra, usar EUR por defecto
}










  async abrirModalBillingData(){

    const modal = await this.modalCtrl.create({
      component: ModalBillingDataPage,
      cssClass: '',
      componentProps: {
     
        
        
      },
    // backdropDismiss:false
    });

    modal.onDidDismiss().then((data) => {
       
      console.log('final',data);
      let theOrigin = (data.data?.origin); 
      console.log('ORIGEN:',theOrigin);
      if(theOrigin=='goBack'){
        console.log("IR ATRAS DESDE MODAL");
      }
      else if(theOrigin=='createBillingData'){

        this.billingDataExist=true;
        this.usingBillingData=true;

      }
      else if(theOrigin=='cantCreateBillingData'){
        this.billingDataExist=false;
        this.usingBillingData=false;
      }

        
    });
    return await modal.present();
  }

  


  }

