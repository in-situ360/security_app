import { Component, OnInit } from '@angular/core';
import {ModalController, NavController, NavParams, Platform} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-modal-message',
  templateUrl: './modal-message.page.html',
  styleUrls: ['./modal-message.page.scss'],
})
export class ModalMessagePage implements OnInit {


  public messageValue:any="";
  public name:any="";

  constructor(private navParams: NavParams,private navController:NavController,private modalCtrl: ModalController,
    private translate : TranslateService
  ) { }

  ngOnInit() {
    if(this.navParams.get('messageValue')!=null){
      this.messageValue = this.navParams.get('messageValue');
      this.name = this.navParams.get('nameValue');
      console.log(this.name);
      console.log('MENSAJE:', this.messageValue);
  
    }
  }

  closeModal(){
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  

}
