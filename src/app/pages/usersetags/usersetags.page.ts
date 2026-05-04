import { Component, OnInit } from '@angular/core';
import {ModalController, NavController, NavParams, Platform} from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE


@Component({
  selector: 'app-usersetags',
  templateUrl: './usersetags.page.html',
  styleUrls: ['./usersetags.page.scss'],
})
export class UsersetagsPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;
  public userLabels:any=[];
  

  public language_code:string='en';

  

  constructor(private platform: Platform,
    private modalCtrl: ModalController,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private translate: TranslateService,
    private navCtrl: NavController,
   ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

  }

  

  ngOnInit() {
   /* this.modalCtrl.dismiss({
      'dismissed': true
    });*/
    
  }


  ionViewDidEnter() {
    console.log(this.translate.langs.length);
  
    if (this.translate.langs.length == 0) {
      console.log("No idioma");
  
      this.utilities.saveLang('en');
    }
    else{
      const currentLang = this.translate.currentLang;
      console.log("Idioma actual:", currentLang);
      //this.form.patchValue({ language_code: currentLang });
      this.language_code=currentLang;
    }

    this.obtainUserLabels();
    
  }


  public obtainUserLabels(){

    this.userLabels =[];
    
    this.apiService.obtainUserLabels({language_code:this.language_code, userId:history.state.userId}).subscribe((result) => {
      console.log('DATOS',result);
      this.userLabels=result;
   

    }, async error => {
     
     this.utilities.showToast(await this.translate.get("usersetags.No se pudo obtener los tags").toPromise()); 
    
      console.log(error);
    });

  }

  goBack() {
    this.navCtrl.pop()
  }


  

  

}
