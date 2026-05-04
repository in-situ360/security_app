import { Component, OnInit } from '@angular/core';
import { RangeValue } from '@ionic/core';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, AbstractControl  } from '@angular/forms';
import { ModalController,NavController, Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Camera, CameraResultType } from '@capacitor/camera';
import { User } from 'src/app/models/User';
import { codeErrors } from 'src/app/utils/utils';
import { ElementRef } from '@angular/core';
import { InfoModalPage } from '../info-modal/info-modal.page';
import { AllImageCropperPage } from '../all-image-cropper/all-image-cropper.page';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE


import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

import { ViewChild, ViewChildren, QueryList } from '@angular/core';
import { IonSelect } from '@ionic/angular';

@Component({
  selector: 'app-participats-permissions-list',
  templateUrl: './participats-permissions-list.page.html',
  styleUrls: ['./participats-permissions-list.page.scss'],
})
export class ParticipatsPermissionsListPage implements OnInit {

  @ViewChildren(IonSelect) permissionSelects!: QueryList<IonSelect>;
  isAndroid: boolean = false;
  isIOS: boolean = false;
  public form:any=null;
  public participants:any=[];

  constructor(private utilities: UtilitiesService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private apiService: ApiService,
    private api: ApiService,
    private platform: Platform,
    private translate: TranslateService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
    private modalController: ModalController) {
      this.isIOS=this.platform.is('ios');
      this.isAndroid=this.platform.is('android');
      this.form = new FormGroup({
        language_code:new FormControl('en'),
        folderId:new FormControl(history.state.folderId),
      
      });
    }

  ngOnInit() {
    this.obtainParticipants();
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.form.patchValue({ language_code: language });
    this.form.patchValue({ folderId:history.state.folderId});

  }

  ionViewDidEnter() {
    console.log(this.translate.langs.length);

    this.utilities.getLang().then(async (result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo==null) {
        console.log("No idioma");
        this.utilities.saveLang('en');
       // const toastMensaje = await this.translate.get("finish-profile.Nombre").toPromise();
        //this.placeholderName = toastMensaje + '*';
  
        
      } else {
        
        this.switchLanguage(prefijo || 'en');
      }
    });
  }


  goBack(){
    this.navCtrl.back()
  }



  public obtainParticipants(){//getSimilarCourses
    this.participants =[];
    
    
    this.apiService.obtainFoldersPermissions(this.form.value).subscribe((result) => {
      console.log('DATOS',result);
      this.participants=this.participants.concat(result['participants']);//concadenar listado vehiculos

     

    }, error => {
      
      this.translate.get('edit-participants.No se pudo obtener más usuarios').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });


    console.log('proyectos: ', this.participants);
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    

  }


  openPermissionSelect(index: number) {
    const selectArray = this.permissionSelects.toArray();
    const targetSelect = selectArray[index];
    if (targetSelect) {
      targetSelect.open();
    }
  }

  onPermissionChange(event: any, participant: any) {
    const selectedValue = event.detail.value;
    console.log('Permiso seleccionado para', participant.name, ':', selectedValue);
    this.apiService.updateFolderParticipantPermission({folderId:history.state.folderId,userId:participant.id,permission:selectedValue}).subscribe((result) => {
      //this.utilities.dismissLoading();
    }, async error => {
      //this.utilities.dismissLoading();
      console.log(error);
    });
  }


}
