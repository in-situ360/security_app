import { Component, OnInit } from '@angular/core';
import {ModalController, NavController, NavParams, Platform} from '@ionic/angular';
import {  ViewChild } from '@angular/core';
import { IonSelect } from '@ionic/angular';

@Component({
  selector: 'app-select-modal',
  templateUrl: './select-modal.page.html',
  styleUrls: ['./select-modal.page.scss'],
})
export class SelectModalPage implements OnInit {

  @ViewChild('selectRef', { static: false }) selectRef: IonSelect;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }

  // Abre el selector después de que el componente se ha cargado completamente
  ngAfterViewInit() {
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
      selectedNetwork: selectedValue
    });
  }

}
