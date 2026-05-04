import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/User';

import { ModalController, NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';//para bd
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Platform } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Stripe, PaymentSheetEventsEnum } from '@capacitor-community/stripe';
import { first } from 'rxjs';


@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {

  public suscription:any=null;

  form: FormGroup;
  //plan_id: any;
  price: any;
  checked = false;

  userId: any = null;//creo una variable
  planId: any = null;


  
  public modalDescript: any = '';


  //price_1QZDKDHTbEq9wEjgbtsZoZYe
  constructor(
    private platform: Platform,
    private formBuilder: FormBuilder,
    private navCtrl: NavController, 
    private apiService: ApiService, 
    public utilities: UtilitiesService

  ) { }

  ngOnInit() {
  }




  async pagar() {

    

    await this.utilities.showLoading('Cargando...');

    // Agrega el evento de PaymentSheet
    Stripe.addListener(PaymentSheetEventsEnum.Completed, () => {
      console.log('PaymentSheetEventsEnum.Completed');
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>0');
    });

    try {
      // ObtÃ©n los datos de pago desde tu backend
      const response = await this.apiService
        .addEntity('stripe', {
          //name: 'alberto',
          //email: 'alberto@prueba.com',
          subId:1,//this.suscriptionSelected.id,
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
        
        
        this.apiService.addEntity('procesarPagoStripe', {type: 'SUBSCRIPTION'}).subscribe((element) => {
          console.log(element);
          console.log('inicia ');

          this.utilities.showToast('Pago completado.');
          //this.setOpen(true);
         // this.modalDescript = `El pago de ${this.suscriptionSelected.name} se ha realizado correctamente`;
         
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>3');
          
        }, (error) => {
          console.log(error);
          this.utilities.dismissLoading();
          

        })
        
        
        //await this.addSubscription().then(() => {
          this.utilities.showToast('Pago completado.');
         // this.setOpen(true);
          //this.modalDescript = `El pago de ${this.suscriptionSelected.name} se ha realizado correctamente`;

          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>3');
          //this.nav.navigateRoot('/tabs/tabs/search');
        //},
        //(error) => {
          //this.utilities.showToast('OcurriÃ³ un error actualizando la suscripciÃ³n.');
          //console.error(error);
      // }
        //);

        
      } else if (
        paymentResult &&
        paymentResult === PaymentSheetEventsEnum.Canceled
      ) {
        this.utilities.showToast('Pago cancelado por el usuario.');
      } else {
        this.utilities.showToast('Ocurrió un error durante la transacción de pago');
      }
    } catch (error) {
      // Manejar el error en caso de problemas con la transacciÃ³n
      this.utilities.showToast('Ocurrió un error durante la transacción de pago');
      console.error(error);
    }
  } 
}