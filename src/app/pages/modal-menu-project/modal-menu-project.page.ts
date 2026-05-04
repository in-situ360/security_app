import { Component, OnInit } from '@angular/core';
import {ModalController, NavController, NavParams, Platform} from '@ionic/angular';
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
import { ModalAddFolderPage } from '../modal-add-folder/modal-add-folder.page';
import { ModalLinkFolderPage } from '../modal-link-folder/modal-link-folder.page';

@Component({
  selector: 'app-modal-menu-project',
  templateUrl: './modal-menu-project.page.html',
  styleUrls: ['./modal-menu-project.page.scss'],
})
export class ModalMenuProjectPage implements OnInit {


  public projectId:any=null;
  public keyCode:any='';
  public form: FormGroup;
  private language_code:string='en';
  isChargeLoading:boolean=false;
  public userId:any=-1;

  public menuMustCloseSubscription: Subscription | null = null;

  constructor(private navController:NavController, 
    private navParams: NavParams,
    private modalController: ModalController,
    private modalCtrl: ModalController,
    private utilities:UtilitiesService,
    private apiService:ApiService,
    private translate: TranslateService) { 

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

    if(this.navParams.get('projectId')!=null){
     this.form.get('projectId').patchValue(this.navParams.get('projectId'));
    }

    this.utilities.getUserId().then((result) => {
      this.userId=result;
  
      
    });



    if(!this.menuMustCloseSubscription){
      
      this.menuMustCloseSubscription=this.apiService.menuMustClose.subscribe(funcion => {
        this.modalCtrl.dismiss({
            'dismissed': true,
         
          });
      });  

    }


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



  selectOption($opc:number){
    console.log($opc);
    if($opc==3){
      this.abrirModalAddFolder();
    }
    else if($opc==2){
       // this.apiService.linkAddChange.next(['title','value']);
        this.abrirModalAddLink();
    }
    else if($opc==1){
        this.apiService.mediaActivated.next();

    }

  }



  async abrirModalAddLink(){

    console.log('del proyecto:',this.navParams.get('projectId'));
      const modal = await this.modalCtrl.create({
        component: ModalLinkFolderPage,
        cssClass: 'EditFolderModal',
        componentProps: {
        folderId:-1,
        projectId:this.navParams.get('projectId'),
        showButton:true
        }
        ,initialBreakpoint: 0.45,// Altura 1/3
        handle: false,               // 🔒 No muestra el handle (línea de arrastre)
        handleBehavior: 'none',      // 🔒 Desactiva el arrastre
        backdropDismiss: true,      // No se cierra tocando fuera
        canDismiss: true,            // Se puede cerrar por código
        showBackdrop: false           // Activa fondo semitransparente 
    });
  
      modal.onDidDismiss().then((data) => {
         console.log(data);

         const dismissedMenu = data.data?.dismissedMenu;
         console.log('HAY QUE VOLVER ATRAS', dismissedMenu);
         if (dismissedMenu) {
           this.closeModal();
         }


      });
      return await modal.present();
    }




  async abrirModalAddFolder(){
      const modal = await this.modalCtrl.create({
        component: ModalAddFolderPage,
        cssClass: 'EditFolderModal',
        componentProps: {
        folderId:null,
        projectId:this.navParams.get('projectId'),
        showButton:true
        }
        ,initialBreakpoint: 0.33,// Altura 1/3
        handle: false,               // 🔒 No muestra el handle (línea de arrastre)
        handleBehavior: 'none',      // 🔒 Desactiva el arrastre
        backdropDismiss: true,      // No se cierra tocando fuera
        canDismiss: true,            // Se puede cerrar por código
        showBackdrop: false           // Activa fondo semitransparente 
    });
  
      modal.onDidDismiss().then((data) => {
         console.log(data);

         const dismissedMenu = data.data?.dismissedMenu;
         console.log('HAY QUE VOLVER ATRAS', dismissedMenu);
         if (dismissedMenu) {
           this.closeModal();
         }


      });
      return await modal.present();
    }



    ngOnDestroy() {
      console.log("ejecutando destroy del modal");

      if (this.menuMustCloseSubscription) {
        this.menuMustCloseSubscription.unsubscribe();
        this.menuMustCloseSubscription = null;
      }

  }




  closeModal(){
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  

}
