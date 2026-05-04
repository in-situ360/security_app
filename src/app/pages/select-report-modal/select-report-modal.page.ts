import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import {ModalController, NavController, NavParams, Platform} from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

import { UtilitiesService } from 'src/app/services/utilities.service';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
@Component({
  selector: 'app-select-report-modal',
  templateUrl: './select-report-modal.page.html',
  styleUrls: ['./select-report-modal.page.scss'],
})
export class SelectReportModalPage implements OnInit {

  public form: FormGroup;
  public userToReportId:any=null;
  public keyCode:any='';

  controlNames = [
    'desnudos_o_actividad_sexual',
    'lenguaje_o_simbolos_que_incitan_al_odio',
    'estafa_o_fraude',
    'violencia_u_organizaciones_peligrosas',
    'venta_de_bienes_ilegales_o_regulados',
    'bullying_o_acoso',
    'infraccion_de_la_propiedad_intelectual',
    'suicidio_o_autolesiones',
    'spam',
    'el_problema_no_aparece_en_la_lista'
  ];

  constructor(private navController:NavController, private navParams: NavParams,private modalCtrl: ModalController,private utilities:UtilitiesService,private apiService:ApiService,private translate: TranslateService) {
    this.form = new FormGroup({
      userToReportId: new FormControl(-1),
      desnudos_o_actividad_sexual: new FormControl(false),
      lenguaje_o_simbolos_que_incitan_al_odio: new FormControl(false),
      estafa_o_fraude: new FormControl(false),
      violencia_u_organizaciones_peligrosas: new FormControl(false),
      venta_de_bienes_ilegales_o_regulados: new FormControl(false),
      bullying_o_acoso: new FormControl(false),
      infraccion_de_la_propiedad_intelectual: new FormControl(false),
      suicidio_o_autolesiones: new FormControl(false),
      spam: new FormControl(false),
      el_problema_no_aparece_en_la_lista: new FormControl(false),
      
      
    });
  }

  ngOnInit() {

    this.keyCode='';

    if(this.navParams.get('userToReportId')!=null){
      this.userToReportId = this.navParams.get('userToReportId');
      console.log('ID usuario:', this.userToReportId);
      
      this.form.patchValue({ userToReportId: this.userToReportId });

    }
    

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

  acceptProject(){

    
  }

  closeModal(){
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  

  onCheckboxChange(controlName: string) {
    if (controlName === 'el_problema_no_aparece_en_la_lista') {
      // Si se selecciona "el_problema_no_aparece_en_la_lista", deseleccionar los demás
      if (this.form.get(controlName)?.value) {
        this.controlNames.forEach(name => {
          if (name !== controlName) {
            this.form.get(name)?.setValue(false);
          }
        });
      }
    } else {
      // Si se selecciona alguna otra opción, deseleccionar "el_problema_no_aparece_en_la_lista"
      if (this.form.get(controlName)?.value) {
        this.form.get('el_problema_no_aparece_en_la_lista')?.setValue(false);
      }
    }
  }

  toggleCheckbox(controlName: string) {
    const control = this.form.get(controlName);
    if (control) {
      control.setValue(!control.value);
      this.onCheckboxChange(controlName); // Llama a onCheckboxChange para aplicar cualquier lógica adicional
    }
  }




  submitForm() {
    // Verifica si al menos un checkbox está seleccionado
    const atLeastOneSelected = Object.keys(this.form.value).some(
      (key) => key !== 'userToReportId' && this.form.value[key] === true
    );
  
    if (!atLeastOneSelected) {
      // Muestra el mensaje de advertencia si no hay ninguna opción seleccionada
      this.translate.get('select-report-modal.Debe seleccionar un motivo de reporte').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
      return; // Detiene la ejecución si no hay ninguna selección
    }
  
    // Envía el reporte si hay una selección
    this.apiService.sendUserReport(this.form.value).subscribe(
      (result) => {
        if (result['state'] === "USERREPORTED") {
          this.translate.get('select-report-modal.Usuario reportado').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText);
          });
          this.closeModal();
        }
      },
      (error) => {
        console.log(error);
        this.translate.get('select-report-modal.No se pudo reportar al usuario').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText);
        });
      }
    );
  }
  

}
