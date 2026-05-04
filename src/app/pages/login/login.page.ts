import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController, Platform } from '@ionic/angular';
import { User } from 'src/app/models/User';
import { ApiService } from 'src/app/services/api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { codeErrors } from 'src/app/utils/utils';
//import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
//import { FacebookLogin, FacebookLoginResponse } from '@capacitor-community/facebook-login';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { Keyboard } from '@capacitor/keyboard';
const FACEBOOK_PERMISSIONS = ['public_profile', 'email'];

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public isUpdating: boolean;
  public form: FormGroup;
  public formInvitado: FormGroup;//PARA ENTRAR COMO INVITADO

  public usuarioFacebook: User;

  isAndroid: boolean = false;
  isIOS: boolean = false;

  password_type: string = 'password';

  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  public deviceInfo: any=null;

  public idenDispositivo:any=null;

  isChargeLoading:boolean=false;

  constructor(
    private apiService: ApiService,
    private utilitiesService: UtilitiesService,
    private navCtrl: NavController,
    private auth: AuthenticationService,
    public platform: Platform,
    private translate: TranslateService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
    private device: Device
    /*private fb: Facebook,
    private googlePlus: GooglePlus*/
  ) {
    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');
   }

  ngOnInit() {


    if(this.device.uuid!=null){
      this.idenDispositivo=this.device.uuid;
      console.log(this.idenDispositivo);
    }
    else{
      this.idenDispositivo='Sin dispositivo';
    }

    

    this.form = new FormGroup({
      email: new FormControl('', 
        {validators: [Validators.required, Validators.email]}
      ),
      password: new FormControl('', 
        {validators: [Validators.required, Validators.minLength(8)]}
      ),
      language_code:new FormControl('en'),
      idenDispositivo: new FormControl(this.idenDispositivo),
      source: new FormControl("app"),
    });

    this.formInvitado = new FormGroup({
      email: new FormControl('invitadoInsitu@gmail.com'),
      password: new FormControl('invInsituPassword'),
      language_code:new FormControl('en'),
      idenDispositivo: new FormControl(this.idenDispositivo),
      source: new FormControl("app"),
    });
  }

  onEnterPress(event: KeyboardEvent) {
    // Verificar si la tecla presionada es Enter
    if (event.key === 'Enter') {
      console.log("Se pulsó Enter");
      Keyboard.hide();  // Cierra el teclado en dispositivos móviles
      console.log("///");
    }
    
  }

  async ionViewDidEnter(){

    this.utilitiesService.getLang().then((result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo==null) {
        console.log("No idioma");
        this.utilitiesService.saveLang('en');
  
        
      } else {
        
        this.switchLanguage(prefijo || 'en');
      }
    });


    const missing = await this.checkMissingPermissions();
    if (missing.length === 0) {
      console.log('✅ Todos los permisos concedidos');
    } else {
     
      console.warn('❌ Faltan permisos:', missing);
      //this.abrirModalPermisos();
      /*await this.requestGeolocationPermission();
      await this.requestCameraPermission();
      await this.requestAudioPermission();*/
      await this.requestPushPermission();
    }
    console.log('Todos los permisos solicitados');


    /***/
      
   // GoogleAuth.initialize();
    //await FacebookLogin.initialize({ appId: '748077676570420' });

  }


  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción

    this.form.patchValue({ language_code: language });
    this.formInvitado.patchValue({ language_code: language }); 
  }




  async checkMissingPermissions(): Promise<string[]> {
    const missingPermissions: string[] = [];

    // Notificaciones push
    const pushPermission = await PushNotifications.checkPermissions();
    if (pushPermission.receive !== 'granted') {
      missingPermissions.push('Push Notifications');
    }

    return missingPermissions;
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




  public async submitForm() {
    this.isChargeLoading=true;
    //console.log("hola");
    //console.log(this.form.valid);
    //console.log(this.form.value);
    //const toastEntrando = await this.translate.get("login.Entrando").toPromise();
    //this.utilitiesService.showLoading(toastEntrando); 
    this.apiService.login(this.form.value).subscribe((user: User) => {
      this.isChargeLoading=false;
      //this.utilitiesService.dismissLoading();
      console.log(user);
      this.apiService.setUserId(user.id);
      this.utilitiesService.saveUserId(user.id);
      this.apiService.setFromRegister(0);
      //Ahora aplicamos la cabecera devuelta a las siguientes peticiones
      this.apiService.setTokenToHeaders(user.api_token);

      //Emitimos el evento de login
      //this.events.publish('user:login');

      //Vamos a inicio
      this.auth.login(user.api_token);

    }, async (error) => {
      this.isChargeLoading=false;
      //this.utilitiesService.dismissLoading();
      const toastMensaje = await this.translate.get(codeErrors(error)).toPromise();
      
      this.utilitiesService.showToast(toastMensaje);
    });
  }


  /**
   * ------------------------------------------- REGISTRO LOGIN GOOGLE CAPACITOR --------------------------------------------------------------------------------------
   * 1. Crear y/o consutar proyecto en Firebase
   * 2. Añadir la app para android y/o iOS y seguir los diferentes pasos
   * 3. Añadir hasta 3 Huellas digitales del certificado SHA (SHA-1) (debug, release y google play console)
   *    - a) keytool -list -v -keystore PATH_DEBUG_KEYSTORE -alias androiddebugkey
   *    - b) keytool -list -v -keystore PATH_KEYSTORE -alias ALIAS_NAME
   *    - c) "Integridad de la aplicación" dentro de la App de Google Play Console
   * 4. Añadir google a la app: Authentication --> Sign-in method --> Habilitar Google
   * 5. Descargar el archivo google-services.json (AÑADIR O REEMPLAZAR en la carpeta android > app) y GoogleService-Info.plist (AÑADIR O REEMPLAZAR en carpeta de ios) 
   * 6. MODIICAR capacitor.config.json con androidClientId (WEB CLIENT ID) y iosClientId (REVERSED CLIENT ID) 
   * ------------------------------------------------------------------------------------------------------------------------------------------------------------------ 
  */

  public async loginGoogle(){
    //const user = await GoogleAuth.signIn();
    
    //console.log("user" , user);
    
  }



  /**
   * ------------------------------------------- REGISTRO LOGIN CON FACEBOOK -------------------------------------------
   * 
   * 1. Registrar la nueva app en : https://developers.facebook.com/apps/
   * 2. Añadir el Login/Registro con Facebook, para Android y/o iOS : 
   *    - Seguir los diferentes pasos para la creación de de los hash (debug and release) (PARA ANDROID)
   *    ---- EJEMPLO GENERACIÓN DEL HASH : keytool -exportcert -alias ALIAS_O_ALIAS_DEBUG -keystore "RUTA_DEBUG_KEY_O_RELEASE_KEY" | "RUTA_OPENSSL" sha1 -binary | "RUTA_OPENSSL" base64
   * 
   * 3. Recoger el identificador de la aplicación (en facebook developers, dentro de la app, en la zona superior izquierda)
   * 4. MODIFICAR APP ID EN EL ARCHIVO android > app > src > main > res > values > string.xml
   
        <string name="facebook_app_id">748077676570420</string>
        <string name="fb_login_protocol_scheme">fb748077676570420</string>
        <string name="facebook_client_token">748077676570420</string>

   * 5. Dentro del developers : Revisión de la aplicación > Permisos y funciones
   *      - Dar permiso a public_profile
   *      - Dar permiso a email
   *      - Realizar la comprobación de uso de datos (tendremos una alerta en naranja).
   *    * 
   * ===================================================================================
   */

  async loginFacebook() {
    //const result = await FacebookLogin.login({ permissions: FACEBOOK_PERMISSIONS });

   // if (result.accessToken && result.accessToken.userId) {
    //  let token = result.accessToken;
     // this.loadUserData(token);
    //} else if (result.accessToken && !result.accessToken.userId) {
      // Web only gets the token but not the user ID
      // Directly call get token to retrieve it now
      //this.getCurrentToken();
    //} else {
      // Login failed
    //}
  }

  async getCurrentToken() {
    //const result = await FacebookLogin.getCurrentAccessToken();

   // if (result.accessToken) {
    //  let token = result.accessToken;
     // this.loadUserData(token);
    //} else {
      // Not logged in.
    //}
  }

  async loadUserData(token) {
    const url = `https://graph.facebook.com/${token.userId}?fields=id,name,picture.width(720),birthday,email&access_token=${token.token}`;
    /*this.http.get(url).subscribe(res => {
      this.user = res;
    });*/

    console.log("url " , url);
    
  }


  
  public loginApple(){

  }



  goToRegisterPage(){

    
    this.navCtrl.navigateForward("/register");
  

}

goToForgotPage(){

  
  this.navCtrl.navigateForward("/forgot-password");


}


loginLikeInvited(){


  //this.utilitiesService.showLoading("Entrando...");
  

  
  this.translate.get('Entrando...').subscribe((translatedText: string) => {
    this.utilitiesService.showLoading(translatedText); 
  });
  

  this.apiService.login(this.formInvitado.value).subscribe(
    async (user: User) => {
      this.utilitiesService.dismissLoading();
      console.log(user);
      this.apiService.setUserId(user.id);
      this.utilitiesService.saveUserId(user.id);
      this.apiService.setFromRegister(0);
      
      //Ahora aplicamos la cabecera devuelta a las siguientes peticiones
      this.apiService.setTokenToHeaders(user.api_token);

      

      //Vamos a inicio
      await this.auth.login(user.api_token);

    
    },
    error => {
      if (error.status) {
        // Capturar el error.status aquí y manejarlo según tus necesidades
        console.log('Error status:', error.status);
        this.utilitiesService.dismissLoading();
        this.utilitiesService.showToast(codeErrors(error));
      }
    }
  );

}

togglePasswordMode() {  

  this.password_type = this.password_type === 'text' ? 'password' : 'text';
 
}





ionViewWillEnter() {
  console.log("SE EJECUTA ionViewWillEnter");

  App.addListener('appStateChange', (state) => {
    //console.log("se lanza evento ACTIVO/INACTIVO");
    this.isActive2=state.isActive;
    if(this.isActive2){
     // console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
     // this.startInterval();
    }
    else{
      //this.clearInterval();

    }
    
  });

  this.routerSubscription = this.router.events.subscribe((event) => {
    if (event instanceof NavigationEnd) {
      // Verifica si la ruta actual no es '/UserSearch'
      if (!event.url.includes('/login')) {
        //console.log('Saliendo de login, limpiando intervalos');
       // this.clearInterval();
      }
      else{
       // this.startInterval();
      }
    }
  });

 

  if(this.interval==null){
   // this.startInterval();
  }


}


ionViewWillLeave() {
  console.log("Se ejecuta ionViewWillLeave");
  //this.clearInterval();
}


ngOnDestroy() {
  //this.clearInterval();
}




// Inicia el intervalo para ejecutar la función cada 5 segundos
private startInterval() {
  this.countSeg=0;
  this.previousDate=new Date();
  if(this.interval==null){
    //console.log("INTERVAL NULL CREANDO UNO NUEVO-----------------------------------");
    this.interval = setInterval(() => {
      this.checkDateDifference();
    }, 2000);
  }
  
}

// Limpia el intervalo cuando se sale de la pestaña
private clearInterval() {
  if (this.interval) {

    //ENVIO TIEMPO
    this.apiService.registerTimeScreen({screenId:41,screenTime:this.countSeg}).subscribe((result) => {
      console.log('DATOS',result);
      
    }, error => {
      
      console.log(error);
    });

   // clearInterval(this.interval);
    //this.interval = null;
  }
  clearInterval(this.interval);
  this.interval = null;
  
}


// Calcula la diferencia entre la fecha anterior y la actual
private checkDateDifference() {
  const currentDate = new Date();


  if(!this.isActive2){

    const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
    this.countSeg=this.countSeg+differenceInSeconds;
    console.log(`login: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
    console.log(this.countSeg);

    //ENVIO TIEMPO
    this.apiService.registerTimeScreen({screenId:41,screenTime:this.countSeg}).subscribe((result) => {
      console.log('DATOS',result);
      
    }, error => {
      
      console.log(error);
    });

   // this.clearInterval();
    return;
  }

 

 
  if (this.isActive2) {
    const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
    this.countSeg=this.countSeg+differenceInSeconds;
    console.log(`login: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
    console.log(this.countSeg);


  } 
  else {
    console.log('login: No hay fecha anterior, usando la actual como inicial.');
  }

  
  this.previousDate = currentDate;
}


getDeviceInfo() {

  


  this.deviceInfo = {
    model: this.device.model,
    platform: this.device.platform,
    version: this.device.version,
    manufacturer: this.device.manufacturer,
    isVirtual: this.device.isVirtual,
    uuid: this.device.uuid
  };

  console.log('📱 Información del dispositivo:', this.deviceInfo);
}

}

