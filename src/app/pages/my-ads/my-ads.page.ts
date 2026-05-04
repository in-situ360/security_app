import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgModel } from '@angular/forms'; // Importa NgModel
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { AlertController, Platform } from '@ionic/angular';
import {ModalController, NavController, NavParams} from '@ionic/angular';
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';
import { Stripe, PaymentSheetEventsEnum,ApplePayEventsEnum, GooglePayEventsEnum, PaymentFlowEventsEnum, } from '@capacitor-community/stripe';
import { first,lastValueFrom } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE


import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { SelectAdvertisementoptionsModalPage } from '../select-advertisementoptions-modal/select-advertisementoptions-modal.page';
import { ModalMultimediaPage } from '../modal-multimedia/modal-multimedia.page';

@Component({
  selector: 'app-my-ads',
  templateUrl: './my-ads.page.html',
  styleUrls: ['./my-ads.page.scss'],
})
export class MyAdsPage implements OnInit {


  isAndroid: boolean = false;
  isIOS: boolean = false;
  public form: FormGroup;
  public advertisements:any = [];
  public advertisementsIds:any = [];

  constructor(private platform: Platform,
    private navCtrl: NavController,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private alertController: AlertController, 
    private router: Router,
    private modalCtrl: ModalController,
    private translate: TranslateService,) {

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');
   }

  ngOnInit() {
    this.form = new FormGroup({
      advertisementsIds:new FormControl([]),
    });
    this.getAdvertisements();
  }

  goBack(){
    this.navCtrl.pop();

  }


  openSelectOptions($id:number){
    console.log($id);
    this.abrirModalOpcionesAnuncio($id);

  }


  async abrirModalOpcionesAnuncio($id:number){
      const modal = await this.modalCtrl.create({
        component: SelectAdvertisementoptionsModalPage,
        cssClass: 'SelectModal',
        componentProps: {
        },
      });
      modal.onDidDismiss().then((data) => {
       const selectedOption = Number(data.data.opc); 
       console.log('Opcion de anuncio devuelta:', selectedOption);
        
        if(selectedOption==1){//VER EL ANUNCIO
          const advertisement = this.advertisements.find(ad => ad.id === $id);
          this.abrirModalMultimedia1(advertisement.thevalue, advertisement.thetype, advertisement.id);
          
        }
        else if(selectedOption==2){//VER USUARIO CREADOR
          //this.abrirModalReporte();
          const advertisement = this.advertisements.find(ad => ad.id === $id);
          this.navCtrl.navigateForward("/other-user", { state: { userId: advertisement.user_id } });

        }
        else{
          console.log("cancelada");
        }
      });
      return await modal.present();
    }




  deleteItem($id:number){
    console.log($id);

    this.apiService.deleteEntity('advertisements', $id).subscribe(res => {
       console.log(res);
       this.advertisements = this.advertisements.filter(a => a.id !== $id);
       this.utilities.showToast(this.translate.instant('my-ads.Anuncio borrado con éxito'));

      
     }, error => {
       console.log(error);
     
     })
  
   
  }



  getAdvertisements(){
    this.form.get('advertisementsIds').patchValue([]);
    this.advertisements = [];
    this.apiService.getAdvertisements(this.form.value).subscribe((result) => {
      console.log('DATOS',result);
      this.advertisements = result['advertisements'];
      this.advertisementsIds=result['advertisementsIds'];
      this.form.get('advertisementsIds').patchValue(this.advertisementsIds);
    }, error => {
      /*this.translate.get('user-search.No se pudo obtener listado de usuarios').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });*/
      console.log(error);
    });
  }



  getMoreAdvertisements(){
    this.apiService.getAdvertisements(this.form.value).subscribe((result) => {
      console.log('DATOS',result);
      this.advertisements = this.advertisements.concat(result['advertisements']);
      this.advertisements = this.advertisements.concat(result['advertisements']);
      this.advertisementsIds=this.advertisementsIds.concat(result['advertisementsIds']);
      this.form.get('advertisementsIds').patchValue(this.advertisementsIds);
    }, error => {
    /*this.translate.get('buscador2.No se pudo obtener listado de usuarios').subscribe((translatedText: string) => {
      this.utilities.showToast(translatedText); 
    });*/
      console.log(error);
    });
  }



  async abrirModalMultimedia1($media,$type,$id){
    
    const modal = await this.modalCtrl.create({
      component: ModalMultimediaPage,
      cssClass: 'MultimediaModal',
      componentProps: {
        mediaArchive: $media,
        mediaType:$type,
        id:$id,
        pdfName:'',
      },
      // backdropDismiss:false
    });
    return await modal.present();
  }
     
  
  goNewAdvertisement(){
    this.navCtrl.navigateForward('upload-advertisement');

  }

}
