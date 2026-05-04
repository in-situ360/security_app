import { Component, OnInit } from '@angular/core';
import {ModalController, NavController, NavParams} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { UtilitiesService } from 'src/app/services/utilities.service';
//-------PARA PERMISOS
import { Geolocation } from '@capacitor/geolocation';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';
import { Camera, CameraResultType } from '@capacitor/camera';
import { VoiceRecorder, RecordingData, GenericResponse } from 'capacitor-voice-recorder';
import { Stripe, PaymentSheetEventsEnum,ApplePayEventsEnum, GooglePayEventsEnum, PaymentFlowEventsEnum, } from '@capacitor-community/stripe';


@Component({
  selector: 'app-modal-request-permissions',
  templateUrl: './modal-request-permissions.page.html',
  styleUrls: ['./modal-request-permissions.page.scss'],
})
export class ModalRequestPermissionsPage implements OnInit {

  constructor(private modalCtrl : ModalController,
    private navCtrl: NavController,
    private translate: TranslateService,
    private utilitiesService: UtilitiesService,
    private navParams: NavParams,) { }

  ngOnInit() {
  }

  async dismiss() {

    await this.requestGeolocationPermission();
    await this.requestCameraPermission();
    await this.requestAudioPermission();
    await this.requestPushPermission();

    this.modalCtrl.dismiss({
      'dismissed': true
    });
      

  }


  async checkMissingPermissions(): Promise<string[]> {
  const missingPermissions: string[] = [];

  // Geolocalización (no tiene check, probamos obtener la posición)
  try {
    await Geolocation.getCurrentPosition();
  } catch (error) {
    missingPermissions.push('Geolocalización');
  }

  // Cámara y fotos
  const cameraPermissions = await Camera.checkPermissions();
  if (cameraPermissions.camera !== 'granted' || cameraPermissions.photos !== 'granted') {
    missingPermissions.push('Cámara');
  }

  // Audio
  const audioPermission = await VoiceRecorder.hasAudioRecordingPermission();
  if (!audioPermission.value) {
    missingPermissions.push('Audio');
  }

  // Notificaciones push
  const pushPermission = await PushNotifications.checkPermissions();
  if (pushPermission.receive !== 'granted') {
    missingPermissions.push('Push Notifications');
  }

  return missingPermissions;
}



  async requestGeolocationPermission() {
    try {
      const position = await Geolocation.getCurrentPosition();
      console.log('Geolocation OK:', position);
    } catch (error) {
      console.error('Geolocation error:', error);
    }
  }

  async requestCameraPermission() {
    const permissions = await Camera.requestPermissions();

    if (permissions.photos === 'denied' || permissions.camera === 'denied') {
      console.warn('Permiso de cámara o fotos denegado:', permissions);
    } else {
      console.log('Permiso de cámara OK:', permissions);
    }
  }

  async requestAudioPermission() {
    const result = await VoiceRecorder.requestAudioRecordingPermission();

    if (!result.value) {
      console.error('No se tienen permisos para grabar audio.');
    } else {
      console.log('Permiso de audio OK');
    }
  }

  async requestPushPermission() {
    try {
      let permStatus = await PushNotifications.requestPermissions();

      if (permStatus.receive === 'granted') {
        console.log('Permiso para notificaciones push OK');
      } else {
        console.warn('Permiso para notificaciones push denegado');
      }
    } catch (error) {
      console.error('Error al pedir permiso de notificaciones push:', error);
    }
  }


}
