import { Component, OnInit } from '@angular/core';
import {ModalController, NavController, NavParams, Platform} from '@ionic/angular';
import {  ViewChild } from '@angular/core';
import { IonSelect } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-select-menu-edit-media',
  templateUrl: './select-menu-edit-media.page.html',
  styleUrls: ['./select-menu-edit-media.page.scss'],
})
export class SelectMenuEditMediaPage implements OnInit {

  @ViewChild('selectRef', { static: false }) selectRef: IonSelect;

  mediaType: any = '';

  constructor(private utilitiesService: UtilitiesService,
    private translate: TranslateService,private modalController: ModalController,private navParams: NavParams) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    
  }

  // Abre el selector después de que el componente se ha cargado completamente
  ngAfterViewInit() {

    console.log(this.translate.langs.length);
  
    if (this.translate.langs.length == 0) {
      console.log("No idioma");
  
      this.utilitiesService.saveLang('es');
    }
    else{
      const currentLang = this.translate.currentLang;
      console.log("Idioma actual:", currentLang);
      //this.form.patchValue({ language_code: currentLang });
      
    }

    this.mediaType = this.navParams.get('mediaType');
    console.log('--->',this.mediaType);
  

    setTimeout(() => {
      this.selectRef.open();
    }, 0);
  }

  // Método para manejar el cambio de selección
  onSelectChange(event: any) {
    const selectedValue = event.detail.value;
    console.log('Red social seleccionada:', selectedValue);
    this.dismissModal(selectedValue);
  }

  // Método para manejar el evento de cancelación del ion-select
  onSelectCancel() {
    console.log('Selección cancelada');
    this.dismissModal(null); // Devuelve 0 al cancelar
  }

  // Método para cerrar el modal y devolver el valor seleccionado
  async dismissModal(selectedValue: number) {
    await this.modalController.dismiss({
      selectedOption: selectedValue
    });
  }


}

