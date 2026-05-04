import { Injectable } from '@angular/core';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE


@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  public loading:HTMLIonLoadingElement;
  public isLoading:boolean=false;
  
  constructor(private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private platform: Platform,
    private toast: ToastController,
    public storage: Storage,
    public trans: TranslateService
    ) { }


    public saveChargeSplash(state: boolean) {
      this.storage.set("stateChargeSplash", state); 
    }
  
   
    public getChargeSplash() {
      return this.storage.get("stateChargeSplash"); 
    }


    public saveLang(lang: string) {
      console.log("Lenguaje actual => " + lang);
      this.storage.set("lang", lang); // Guardar en el storage
      this.trans.use(lang); // Cambiar el idioma en el servicio de traducción
    }
  
    // Obtiene el lenguaje del almacenamiento local usando promesas
    public getLang() {
      return this.storage.get("lang"); // Retorna una promesa
    }


    public saveUserId(userId: number) {
      console.log("userId => " + userId);
      this.storage.set("userId", userId); // Guardar en el storage
      
    }
  
   
    public getUserId() {
      return this.storage.get("userId"); // Retorna una promesa
    }

  
/**
   * Muestra loading
   * @param message Mensaje del loading (opcional)
   */
async showLoading(message?: string, duration?: number) {
  this.isLoading=true;
  this.loading= await this.loadingCtrl.create({
    message: message ? message : null,
    duration: duration ? duration : null
  });
  await this.loading.present();
  if(!this.isLoading && this.loading){
    this.loading.dismiss();

  }
}


/**
 * Quita el loading cargado (arreglado)
 */
public async dismissLoading() {
  this.isLoading=false;
  await this.loading.dismiss();
}

/**
 * Devuelve el sistema operativo del dispositivo
 */
public getPlatform() {
  return this.platform.is('ios') ? 'ios' : 'android';
}

/**
 * Devuelve el nombre del archivo pasado (incluida la extensión)
 * @param path Ruta del archivo
 */
public getFileName(path: string) {
  return path.split('/').pop();
}

/**
 * Devuelve la extensión del archivo pasado
 * @param path Ruta del archivo
 */
public getFileExtension(path: string) {
  return path.split('.').pop().toLowerCase();
}

/**
 * Muestra un alert genérico para notificar algo (un error, éxito, etc)
 * @param title Título del alert
 * @param message Mensaje del alert
 */
public async showAlert(title: string, message: string, backdropDismiss = true) {
  let alert = await this.alertCtrl.create({
    header: title,
    message: message,
    buttons: ['OK'],
    backdropDismiss: backdropDismiss
  });

  alert.present();
}

/**
 * Muestra un toast genérico para notificar algo (un error, éxito, etc)
 * @param message Mensaje del toast
 */
public async showToast(message: string) {
    const toast = await this.toast.create({
      message: message,
      duration: 5000,
      buttons:['OK']
    });
    toast.present();
}

public capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
}
