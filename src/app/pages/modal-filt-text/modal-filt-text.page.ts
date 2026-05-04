import { Component, OnInit } from '@angular/core';
import {ModalController, NavController, NavParams, Platform} from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE

@Component({
  selector: 'app-modal-filt-text',
  templateUrl: './modal-filt-text.page.html',
  styleUrls: ['./modal-filt-text.page.scss'],
})
export class ModalFiltTextPage implements OnInit {

  public projectId:any=null;
  public keyCode:any='';

  public filtText:any="";
  constructor(private navController:NavController, private navParams: NavParams,private modalCtrl: ModalController,private utilities:UtilitiesService,private apiService:ApiService,private translate: TranslateService) {

  }

  ngOnInit() {

    this.keyCode='';

    if(this.navParams.get('projectId')!=null){
      this.projectId = this.navParams.get('projectId');
      console.log('ID proyecto:', this.projectId);

    }

    if(this.navParams.get('filtText')!=null){
      this.filtText = this.navParams.get('filtText');

    }
    

  }


  ionViewDidEnter() {
    console.log(this.translate.langs.length);
  
    if (this.translate.langs.length == 0) {
      console.log("No idioma");
  
      this.utilities.saveLang('en');
    }
  }

  

  closeModal(){
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  async sendFiltName() {
    await this.modalCtrl.dismiss({
      filtText: this.filtText
    });
  }

}
