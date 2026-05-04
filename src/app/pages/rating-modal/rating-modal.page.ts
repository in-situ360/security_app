import { Component, OnInit } from '@angular/core';
import {ModalController, NavController, NavParams} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-rating-modal',
  templateUrl: './rating-modal.page.html',
  styleUrls: ['./rating-modal.page.scss'],
})
export class RatingModalPage implements OnInit {


  public name:any='';
  public info:any='';

  constructor(
    private modalCtrl : ModalController,
    private navCtrl: NavController,
    private translate: TranslateService,
    private utilitiesService: UtilitiesService,
    private navParams: NavParams,
  ) { }

  ionViewDidEnter() {
    console.log(this.translate.langs.length);
  
    if(this.navParams.get('name')!=null){
      this.name = this.navParams.get('name');
    }
    if(this.navParams.get('info')!=null){
      this.info = this.navParams.get('info');
    }

    setTimeout(() => {
      this.dismiss();
    }, 2000);
  }

  dismiss() {

      this.modalCtrl.dismiss({
        'dismissed': true
      });

  }


  ngOnInit() {
  }

}
