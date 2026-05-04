import { Component, OnInit } from '@angular/core';
import {ModalController, NavController, NavParams, Platform} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { UtilitiesService } from 'src/app/services/utilities.service';


@Component({
  selector: 'app-range-price-modal',
  templateUrl: './range-price-modal.page.html',
  styleUrls: ['./range-price-modal.page.scss'],
})
export class RangePriceModalPage implements OnInit {

  public rangePrice:any=-1;
  constructor(private utilitiesService: UtilitiesService,private navParams: NavParams,private modalController: ModalController,private translate: TranslateService) {

  }

  ngOnInit() {
    this.rangePrice = this.navParams.get('rangePrice');
    console.log('Rnago recibido:', this.rangePrice);

    if(this.rangePrice==-1){
      this.rangePrice=100;

    }
  }


  ionViewDidEnter() {
    console.log(this.translate.langs.length);
  
    if (this.translate.langs.length == 0) {
      console.log("No idioma");
  
      this.utilitiesService.saveLang('es');
    }
  }

  onIonChange(event: any) {
    this.rangePrice = event.detail.value;
    console.log('Rango seleccionado:', this.rangePrice);
  }

  async dismissModal() {
    await this.modalController.dismiss({
      rangePrice: this.rangePrice
    });
  }

  async resetear(){
    await this.modalController.dismiss({
      rangePrice: 100//-1
    });

  }

}
