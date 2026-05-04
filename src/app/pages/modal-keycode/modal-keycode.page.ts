import { Component, OnInit } from '@angular/core';
import {ModalController, NavController, NavParams, Platform} from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE


@Component({
  selector: 'app-modal-keycode',
  templateUrl: './modal-keycode.page.html',
  styleUrls: ['./modal-keycode.page.scss'],
})
export class ModalKeycodePage implements OnInit {

  public projectId:any=null;
  public keyCode:any='';
  constructor(private navController:NavController, private navParams: NavParams,private modalCtrl: ModalController,private utilities:UtilitiesService,private apiService:ApiService,private translate: TranslateService) {

  }

  ngOnInit() {

    this.keyCode='';

    if(this.navParams.get('projectId')!=null){
      this.projectId = this.navParams.get('projectId');
      console.log('ID proyecto:', this.projectId);

    }
    

  }

  ionViewDidEnter() {
    console.log(this.translate.langs.length);
  
    if (this.translate.langs.length == 0) {
      console.log("No idioma");
  
      this.utilities.saveLang('en');
    }
  }

  acceptProject(){

    if(this.keyCode){
      this.apiService.acceptProject({projectId:this.projectId,keyCode:this.keyCode}).subscribe((result) => {
        console.log('DATOS',result);
        if(result['state']=='WITHOUTSUB'){
          
          this.translate.get('modal-keycode.Adquiera una suscripción para poder aceptar y rechazar proyectos').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
          this.apiService. projectsChanges.next();
          //this.navController.navigateRoot('/tabs/workspace');
          //this.closeModal();
        }
        else if(result['state']=='ACCEPTED'){
          
          this.translate.get('modal-keycode.¡Proyecto aceptado!').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
          this.apiService. projectsChanges.next();
          this.navController.navigateRoot('/tabs/workspace');
          this.closeModal();
        }
        else if(result['state']=='RELATION NOT EXIST'){
         
          this.translate.get('modal-keycode.El proyecto ya no se encuentra asociado a su cuenta').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
          this.apiService. projectsChanges.next();
          this.navController.navigateRoot('/tabs/workspace');
          this.closeModal();
        }
        else if(result['state']=='PROJECT NOT EXIST'){
         
          this.translate.get('modal-keycode.El proyecto ya no existe').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
          this.apiService. projectsChanges.next();
          this.navController.navigateRoot('/tabs/workspace');
          this.closeModal();
        }
        else if(result['state']=='KEYCODE INCORRECT'){
         
          this.translate.get('modal-keycode.El KeyCode introducino no es correcto').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
        }
  
        
  
        
      }, error => {
        this.translate.get('modal-keycode.No se pudo verificar usuario en el proyecto').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        
        console.log(error);
      });
    }
    else{
      
      this.translate.get('modal-keycode.Introduzca una clave para continuar').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
    }
  }

  closeModal(){
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

}
