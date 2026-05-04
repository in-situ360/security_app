import { Component, OnInit } from '@angular/core';
import {AlertController, ModalController, NavController, NavParams, Platform} from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE


import { User } from 'src/app/models/User';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { codeErrors } from 'src/app/utils/utils';
import { Camera, CameraResultType } from '@capacitor/camera';
import { ValidationErrors } from '@angular/forms';
import { AllImageCropperPage } from '../all-image-cropper/all-image-cropper.page';
import { ViewChild, ElementRef } from '@angular/core';
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';


import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-modal-edit-folder',
  templateUrl: './modal-edit-folder.page.html',
  styleUrls: ['./modal-edit-folder.page.scss'],
})
export class ModalEditFolderPage implements OnInit {

  public projectId:any=null;
  public keyCode:any='';
  public form: FormGroup;
  private language_code:string='en';
  isChargeLoading:boolean=false;
  public userId:any=-1;

  constructor(private navController:NavController, 
    private navParams: NavParams,
    private modalController: ModalController,
    private modalCtrl: ModalController,
    private utilities:UtilitiesService,
    private apiService:ApiService,
    private translate: TranslateService,
   private alertCtrl: AlertController,) {


    this.form = new FormGroup({
      projectId: new FormControl(-1),
      name: new FormControl('', [Validators.required]),
      folderId: new FormControl(''/*, [Validators.required]*/),
      language_code: new FormControl('en'),

    });
  }

  ngOnInit() {

   

    if(this.navParams.get('name')!=null){
      this.form.get('name').patchValue(this.navParams.get('name'));
    }
    if(this.navParams.get('folderId')!=null){
     this.form.get('folderId').patchValue(this.navParams.get('folderId'));
    }

    this.utilities.getUserId().then((result) => {
      this.userId=result;
  
      
    });
    

  }

  ionViewDidEnter() {
    console.log(this.translate.langs.length);
  
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
    this.form.get('language_code').patchValue(language);
   // this.form2.get('language_code').patchValue(language);
  }




  public async submitForm(): Promise<void> {
    console.log(this.form.value);
    this.isChargeLoading=true;
    this.apiService.updateFolder(this.form.value).subscribe(async (result) => {
      if (result['state'] == 'UPDATED') {
        
        //HACER UN CHANGE
        this.apiService.folderChanges.next({ type: 'update',folder:result['actuProject']});
        this.isChargeLoading=false;
        this.translate.get('Carpeta actualizada').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
          
          this.modalCtrl.dismiss({
            'dismissed': true,
            //'newName':result['actuProject'].name,
          });
        });

        setTimeout(() => {
          //this.goBack();
          this.closeModal();
        }, 200);        
      } 
      else if (result['state'] =='SUB_NOT_ALLOWED'){
        this.isChargeLoading=false;
        
        if(result['creatorId']==this.userId){
          this.abrirModalInvitado();
        }
        else{
          this.utilities.showToast(this.translate.instant("El creador del proyecto no cuenta con la suscripción necesaria"));
        }
      }
      else if (result['state'] =='DATE_ENDED'){
        // await this.esperar(250);
        this.isChargeLoading=false;

        //this.utilities.dismissLoading();
        this.utilities.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));
      }
      else if (result['state'] =='WITHOUT_PERMISSION'){
        this.isChargeLoading=false;
        this.utilities.showToast(this.translate.instant("No tiene permiso para acceder al contenido de esta carpeta"));

      }
      else {
       //  await this.esperar(250);
       this.isChargeLoading=false;

        //this.utilities.dismissLoading();
        console.log("respuesta inesperada");
        console.log(result['state']);
        console.log("--------------------");
      }

    }, async (error) => {
       //await this.esperar(250);
       this.isChargeLoading=false;

      //this.utilities.dismissLoading();
      this.utilities.showToast(this.translate.instant(codeErrors(error)));
    });
  }




  async mostrarAlertaBorrado() {
      const title = await this.translate.get("¿Desea eliminar la carpeta?").toPromise();
      const toastMensaje = await this.translate.get("Se perderá todo su contenido").toPromise();
      const toastMensaje2 = await this.translate.get("my-jobs.No").toPromise();
      const toastMensaje3 = await this.translate.get("my-jobs.Sí").toPromise();
      
      const alert = await this.alertCtrl.create({
        //header:'Acceso denegado',
        header: title,
        message: toastMensaje,
        cssClass: 'custom-button-class',
        buttons: [
          {
            text: toastMensaje2,
            role: 'cancel',
            cssClass: 'custom-button-class',
            handler: () => {
              console.log('Clic en Cancelar');
            }
          },
          {
            text: toastMensaje3,
            cssClass: 'custom-button-class',
            handler: () => {
              console.log('Clic en Aceptar');
              this.deleteFolder();
              

            },
            //cssClass: 'custom-button-class' 
          }
        ],
        backdropDismiss:false
      });

      await alert.present();
    }





  deleteFolder(){
    
    this.isChargeLoading=true;
    this.apiService.deleteFolder({folderId:this.navParams.get('folderId')}).subscribe(async (result) => {
      let val =result['state'];
      console.log(val);
      if (val == 'DELETED') {
        
        //HACER UN CHANGE
        this.apiService.folderChanges.next({ type: 'delete',folder:result['projectId']});
        this.isChargeLoading=false;
        this.translate.get('Carpeta Eliminada').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
          
          this.modalCtrl.dismiss({
            'dismissed': true,
            'state':'deleted',
            //'newName':result['actuProject'].name,
          });
        });

        setTimeout(() => {
          //this.goBack();
          this.closeModal();
        }, 200);        
      } 
      else if (result['state'] =='SUB_NOT_ALLOWED'){
        this.isChargeLoading=false;

        if(result['creatorId']==this.userId){
          this.abrirModalInvitado();
        }
        else{
          this.utilities.showToast(this.translate.instant("El creador del proyecto no cuenta con la suscripción necesaria"));
        }


        
      }
      else if (result['state'] =='DATE_ENDED'){
        // await this.esperar(250);
        this.isChargeLoading=false;

        //this.utilities.dismissLoading();
        this.utilities.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));
      }
      else if (result['state'] =='WITHOUT_PERMISSION'){
        this.isChargeLoading=false;
        this.utilities.showToast(this.translate.instant("No tiene permiso para acceder al contenido de esta carpeta"));

      }
      else {
       //  await this.esperar(250);
       this.isChargeLoading=false;

        //this.utilities.dismissLoading();
        console.log("respuesta inesperada");
        console.log(result['state']);
        console.log("--------------------");
      }

    }, async (error) => {
       //await this.esperar(250);
       this.isChargeLoading=false;

      //this.utilities.dismissLoading();
      this.utilities.showToast(this.translate.instant(codeErrors(error)));
    });

  }


closeModal(){
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }




async abrirModalInvitado(){


    let titleText=this.translate.instant('edit-project.Sin Suscripción válida');
    let infoText=this.translate.instant('edit-project.Hazte con el plan 360 para crear y administrar proyectos');

    const modal = await this.modalController.create({
      component: InvitadoModalPage,
      cssClass: 'InvitadoMensajeModal',
      componentProps: {
      title:titleText,
      info:infoText,
      showButton:true
        
        
      },
    // backdropDismiss:false
    });

    modal.onDidDismiss().then((data) => {
       
       console.log(data);
       let noBack = (data.data?.noBack); 
       console.log('HAY QUE VOLVER ATRAS',noBack);
       if(!noBack){
        //this.goBack();
        this.closeModal();
       }

    
    });


    return await modal.present();
  }
  

}
