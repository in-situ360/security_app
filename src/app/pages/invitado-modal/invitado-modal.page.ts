import { Component, OnInit } from '@angular/core';
import {ModalController, NavController, NavParams} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { UtilitiesService } from 'src/app/services/utilities.service';


@Component({
  selector: 'app-invitado-modal',
  templateUrl: './invitado-modal.page.html',
  styleUrls: ['./invitado-modal.page.scss'],
})
export class InvitadoModalPage implements OnInit {

  public title:any='';
  public info:any='';
  public showButton:boolean=false;

  constructor(
    private modalCtrl : ModalController,
    private navCtrl: NavController,
    private translate: TranslateService,
    private utilitiesService: UtilitiesService,
    private navParams: NavParams,
  ) { }

  ngOnInit() {


  }

  ionViewDidEnter() {
    console.log(this.translate.langs.length);
  
    if(this.navParams.get('title')!=null){
      this.title = this.navParams.get('title');
    }
    if(this.navParams.get('info')!=null){
      this.info = this.navParams.get('info');
    }

    if(this.navParams.get('showButton')!=null){
      this.showButton = true;
    }
  }

  dismiss() {

      this.modalCtrl.dismiss({
        'dismissed': true
      });
      

  }


  goToPlans(){
    this.modalCtrl.dismiss({
        'dismissed': true,
        'noBack':true
      });
    this.navCtrl.navigateForward('my-suscription', {state: {fromPopPup:true}});
  }

}
