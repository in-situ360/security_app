import { Component, NgZone, OnInit } from '@angular/core';
import {ModalController, NavController, NavParams, Platform} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-create-pnchat-modal',
  templateUrl: './create-pnchat-modal.page.html',
  styleUrls: ['./create-pnchat-modal.page.scss'],
})
export class CreatePnchatModalPage implements OnInit {

  public form: FormGroup;
  public projectId:number=-1;
  public participantSelected:any=null;
  public participants:any=[];
  isChargeLoading:boolean=false;

  constructor(private navController:NavController, 
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private utilities:UtilitiesService,
    private apiService:ApiService,
    private translate: TranslateService,
    private ngZone : NgZone,
  ) { }

  ngOnInit() {//this.translate.instant('Adquiera plan válido');
    
    this.projectId = this.navParams.get('projectId');
    console.log('Usuario id: ',this.navParams.get('projectId'));

   // this.utilities.showLoading('');
    this.isChargeLoading=true;

    this.apiService.obtainParticipantList({projectId:this.projectId}).subscribe((result) => {
      this.participants=result['participants'];
      console.log(result);
      //this.utilities.dismissLoading();
      this.isChargeLoading=false;


      /*if(result['status']=='DATE_ENDED'){
        this.isDateEnded=true;
      }*/


      
      
      

    }, async error => {
      //this.utilities.dismissLoading();  
      this.isChargeLoading=false;
   
      console.log(error);
    });
    
  }


  ionViewDidEnter() {
    
  
    this.utilities.getLang().then((result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo==null) {
        console.log("No idioma");
        this.utilities.saveLang('en');
  
        
      } else {
        
        this.switchLanguage(prefijo || 'en');
      }
    });
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    
  }

  isUserSelected(participant): boolean {
    if(this.participantSelected==null){
      return false;
    }
    else{
      return this.participantSelected?.id === participant.id;
    }
  }

  selectParticipant(participant){
    this.participantSelected=participant;
  }

  createNewPnChat(){
    //this.utilities.showLoading('');

    this.ngZone.run(() => {
      this.isChargeLoading=true;
    });

    this.apiService.createNewPnChat({projectId:this.projectId,userToCreateId:this.participantSelected.id}).subscribe((result) => {
      if(result['status']=='CHAT_CREATED'){
       console.log("chat creado");
     //  this.utilities.showToast("Chat creado con éxito");
       this.utilities.showToast(this.translate.instant('Chat creado con éxito'));
        this.modalCtrl.dismiss({
        isChatCreated: true
      });
      }
      //this.utilities.dismissLoading();
      this.isChargeLoading=false;


    }, async error => {
      //this.utilities.dismissLoading();  
      this.isChargeLoading=false;
   
      console.log(error);
    });
  }

}
