import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { User } from 'src/app/models/User';
import { ApiService } from 'src/app/services/api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { codeErrors, confirmPassword } from 'src/app/utils/utils';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { Storage } from '@ionic/storage-angular';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';

declare var google; //GOOGLEPLACE

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  isSurname1Valid:boolean=false;
  isRepresentativeNameValid=false;

  form: FormGroup;
  submitted: boolean = false;
  public typeUser:String='Personal';
  public isCheckSelected:boolean=false;

  password_type1: string = 'password';
  password_type2: string = 'password';
  public ruta:string='assets/icon/user-1.svg';

  placeholderName: string;


  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------
  isChargeLoading:boolean=false;

  constructor(
    private apiService: ApiService,
    private utilitiesService: UtilitiesService,
    private navCtrl: NavController,private auth: AuthenticationService,
    private translate: TranslateService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
  ) { 
      


      this.form = new FormGroup({
        
        name: new FormControl('', { validators: [Validators.required, Validators.minLength(3)] }),
        surname1: new FormControl(''),
        surname2: new FormControl(''),
        country: new FormControl('Unspecified'),
        lat: new FormControl(0),
        lng: new FormControl(0),
        representativeName: new FormControl(''),
        source: new FormControl("app"),
        email: new FormControl('', { validators: [Validators.required, Validators.email, this.advancedEmailValidator2()/*,this.validEmailExtension()*/] }),
        //password: new FormControl('', { validators: [Validators.required, Validators.minLength(8)] }),
        password: new FormControl('', {
          validators: [Validators.required, Validators.minLength(8),this.strongPasswordValidator()]
        }),
        password_confirmation: new FormControl('', { validators: [Validators.required, Validators.minLength(8), confirmPassword] }),
        typeUser: new FormControl(this.typeUser),
        language_code:new FormControl('en'),
        checkbox: new FormControl(false, { validators: [Validators.requiredTrue] })
      }, { validators: this.surnameValidator });
      console.log(this.form.value);

      //this.form.get('surname1').patchValue('');
      //this.form.get('latestUploads').patchValue(false);
      //this.form.value
      


      

    }

    async ionViewDidEnter() {
      
      

      this.obtainActualLoc();
      
      console.log(this.translate.langs.length);
    
      this.utilitiesService.getLang().then(async (result) => {
        const prefijo = result;
        console.log(prefijo); // Esto debería mostrar "en"
        if (prefijo==null) {
          console.log("No idioma");
          this.utilitiesService.saveLang('en');
    
          
        } else {
          
          this.switchLanguage(prefijo || 'en');
        }
        const toastMensaje =  this.translate.instant("Nombre");
        this.placeholderName = toastMensaje + '*';
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
      
      
    }

    switchLanguage(language: string) {
      this.translate.use(language); // Cambiar el idioma en el servicio de traducción
      this.form.patchValue({ language_code: language });
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

    onEnterPress(event: KeyboardEvent) {
      // Verificar si la tecla presionada es Enter
      if (event.key === 'Enter') {
        console.log("Se pulsó Enter");
        Keyboard.hide();  // Cierra el teclado en dispositivos móviles
        console.log("///");
      }
      
    }

  public ngOnInit(): void {

/*
    this.form = new FormGroup({
      name: new FormControl('', 
        {validators: [Validators.required]}
      ),
      email: new FormControl('', 
        {validators: [Validators.required, Validators.email]}
      ),
      password: new FormControl('', 
        {validators: [Validators.required, Validators.minLength(8)]}
      ),
      password_confirmation: new FormControl('', 
        {validators: [Validators.required, Validators.minLength(8), confirmPassword]}
      ),
    });
    */

  }


  strongPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      if (!password) return null;
  
      // Expresión regular: mínimo una mayúscula, un número, y un carácter especial
      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>-]/.test(password);
  
      const passwordValid = hasUpperCase && hasNumber && hasSpecialChar;
  
      return !passwordValid ? { strongPassword: true } : null;
    };
  }

  advancedEmailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      if (!email) return null;
  
      // Validaciones adicionales:
      const hasValidStructure = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email); // Estructura general
      const domainRestriction = /\.(com|org|net|edu)$/i.test(email); // Solo permite ciertas extensiones
      const noDisposableDomains = !/(@mailinator\.com|@tempmail\.com|@guerrillamail\.com)$/.test(email); // Evita dominios desechables
  
      const emailValid = hasValidStructure && domainRestriction && noDisposableDomains;
  
      return !emailValid ? { advancedEmail: true } : null;
    };
  }

  validEmailExtension(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      if (!email) return null;
  
      // Expresión regular para limitar las extensiones a .com, .org, .net, .edu
      //const validExtensionsRegex = /\.(com|org|net|edu)$/i;
      const validExtensionsRegex = /\.(com|org|net|edu|es)$/i;

  
      const hasValidExtension = validExtensionsRegex.test(email);
  
      return !hasValidExtension ? { invalidEmailExtension: true } : null;
    };
  }

  advancedEmailValidator2(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      if (!email) return null;
  
      // Reglas adicionales para el email
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const forbiddenDomains = ['spam.com', 'baddomain.com']; // Dominios no permitidos
      const consecutiveSpecialChars = /(\.\.|--|__)/; // Carácteres especiales consecutivos
  
      // Comprobaciones
      const isValidPattern = emailPattern.test(email);
      const hasConsecutiveSpecialChars = consecutiveSpecialChars.test(email);
      const domain = email.split('@')[1];
      const isForbiddenDomain = forbiddenDomains.includes(domain);
  
      // Determinamos los errores
      const errors: ValidationErrors = {};
      if (!isValidPattern) errors['invalidFormat'] = true;
      if (hasConsecutiveSpecialChars) errors['consecutiveSpecialChars'] = true;
      if (isForbiddenDomain) errors['forbiddenDomain'] = true;
  
      return Object.keys(errors).length > 0 ? errors : null;
    };
  }



  surnameValidator: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
    const typeUser = control.get('typeUser');
    const surname1 = control.get('surname1');
    const surname2 = control.get('surname2');
    const representativeName = control.get('representativeName');
    
    const isSurname1Valid = surname1 && surname1.value.trim() !== '';
    //const isSurname2Valid = surname2 && surname2.value.trim() !== '';
    const isRepresentativeNameValid = representativeName.value.trim() !== '';

    if(typeUser.value=='Personal'){  
      if (!isSurname1Valid /*|| !isSurname2Valid*/) {
        console.log('surnames no validos');
        this.isSurname1Valid=true;
        return { 'surnameRequired': true };
      }
      else{
        this.isSurname1Valid=false;
      }
    }
    if(typeUser.value=='Empresa'){  
      if (!isRepresentativeNameValid) {
        console.log('nombre empresa no valido');
        this.isRepresentativeNameValid=true;
        return { 'representativeNameRequired': true };
      }
      else{
        this.isRepresentativeNameValid=false;
      }
    }
    //console.log(typeUser.value);
    console.log('-------');



    
    return null;
  }

  isSelected() {
    this.isCheckSelected = !this.isCheckSelected;
    this.form.get('checkbox').setValue(this.isCheckSelected); // Actualiza el valor del checkbox en el formulario
  }



  public  async submitForm(): Promise<void> {

    
    this.navCtrl.navigateForward('/finish-register', { state: { loginForm:this.form.value } });


    /*const toastMensaje = await this.translate.get("register.Registrando usuario").toPromise();
    
    this.isChargeLoading=true;

    this.apiService.register(this.form.value)

    this.apiService.register(this.form.value).subscribe(async (user : User) => {
      this.apiService.setFromRegister(1);
      //this.utilitiesService.dismissLoading();
      this.isChargeLoading=false;

      this.apiService.login(this.form.value).subscribe(
        async (user: User) => {
          this.utilitiesService.dismissLoading();
          console.log(user);
          this.utilitiesService.saveUserId(user.id);//--------guardo id tmabien tras registrarse
         
          //Ahora aplicamos la cabecera devuelta a las siguientes peticiones
          this.apiService.setTokenToHeaders(user.api_token);
  
          //Emitimos el evento de login
          // this.events.publish('user:login');
  
          //Vamos a inicio
          await this.auth.login(user.api_token);
  
         
        },
        error => {
          if (error.status) {
            // Capturar el error.status aquí y manejarlo según tus necesidades
            console.log('Error status:', error.status);
            //this.utilitiesService.dismissLoading();
            this.isChargeLoading=false;
            this.utilitiesService.showToast(codeErrors(error));
          }
        }
      );

    }, (error) => {
      this.isChargeLoading=false;
      //this.utilitiesService.dismissLoading();
      this.utilitiesService.showToast(codeErrors(error));

    });*/
  }






  public  async submitFormAndLogin(): Promise<void> {
    const toastMensaje = await this.translate.get("register.Registrando usuario").toPromise();
    //this.utilitiesService.showLoading(toastMensaje); 
    
    this.isChargeLoading=true;

    this.apiService.register(this.form.value)

    this.apiService.register(this.form.value).subscribe(async (user : User) => {
      this.apiService.setFromRegister(1);
      //this.utilitiesService.dismissLoading();
      this.isChargeLoading=false;

      this.apiService.login(this.form.value).subscribe(
        async (user: User) => {
          this.utilitiesService.dismissLoading();
          console.log(user);
          this.utilitiesService.saveUserId(user.id);//--------guardo id tmabien tras registrarse
         
          //Ahora aplicamos la cabecera devuelta a las siguientes peticiones
          this.apiService.setTokenToHeaders(user.api_token);
  
          //Emitimos el evento de login
          // this.events.publish('user:login');
  
          //Vamos a inicio
          await this.auth.login(user.api_token);
  
         
        },
        error => {
          if (error.status) {
            // Capturar el error.status aquí y manejarlo según tus necesidades
            console.log('Error status:', error.status);
            //this.utilitiesService.dismissLoading();
            this.isChargeLoading=false;
            this.utilitiesService.showToast(codeErrors(error));
          }
        }
      );

    }, (error) => {
      this.isChargeLoading=false;
      //this.utilitiesService.dismissLoading();
      this.utilitiesService.showToast(codeErrors(error));

    });
  }



  async selectTypeUser($value){

    this.typeUser=$value;
    console.log('Tipo usuario: ',this.typeUser);
    //borrar del form los campos del anterior tipo


    if(this.typeUser=='Empresa'){
       this.form.get('surname1').patchValue('');
       this.form.get('surname2').patchValue('');
       this.ruta='assets/icons/business.svg';
       const toastMensaje = await this.translate.instant("Nombre de Compañía");
       this.placeholderName = toastMensaje + '*';
    }
    else{
      this.ruta='assets/icon/user-1.svg';
      const toastMensaje = await this.translate.instant("register.Nombre");
      this.placeholderName = toastMensaje + '*';

     
      this.form.get('representativeName').patchValue('');
    }
    this.form.get('typeUser').patchValue(this.typeUser+'');
  }

  goFinalRegister(){

    this.navCtrl.navigateRoot('/finish-profile', { state: { isFromLogin:true }});


  }

  goLogin(){

    this.navCtrl.navigateRoot('/login');


  }

  togglePasswordMode($opc) {  


    if($opc==1){
      this.password_type1 = this.password_type1 === 'text' ? 'password' : 'text';
    }
    else{
      this.password_type2 = this.password_type2 === 'text' ? 'password' : 'text';

    }
    
   
  }

  async validateAndSubmit(): Promise<void> {
    this.submitted = true; // Activa la visualización de errores
    console.log('Password:', this.form.get('password')?.value);
    console.log('Confirmación:', this.form.get('password_confirmation')?.value);
    console.log('Iguales?', this.form.get('password')?.value === this.form.get('password_confirmation')?.value);
    if(this.form.valid) {
      this.submitForm();
    } else {
      const toastMensaje = await this.translate.get("register.Por favor, revisa los campos con errores antes de continuar").toPromise();
      this.utilitiesService.showToast(toastMensaje);
    }
  }


  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
    console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
    // this.startInterval();
      }
      else{
    // this.clearInterval();

      }
      
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Verifica si la ruta actual no es '/UserSearch'
        if (!event.url.includes('/register')) {
          //  console.log('Saliendo de register, limpiando intervalos');
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
   
    // this.clearInterval();
  }

  
  ngOnDestroy() {
   
    // this.clearInterval();
  }

  


  // Inicia el intervalo para ejecutar la función cada 5 segundos
  private startInterval() {
    this.countSeg=0;
    this.previousDate=new Date();
    if(this.interval==null){
      console.log("INTERVAL NULL CREANDO UNO NUEVO-----------------------------------");
      this.interval = setInterval(() => {
        this.checkDateDifference();
      }, 2000);
    }
    
  }

  // Limpia el intervalo cuando se sale de la pestaña
  private clearInterval() {
    if (this.interval) {

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:42,screenTime:this.countSeg}).subscribe((result) => {
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
     // console.log(`register: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
     // console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:42,screenTime:this.countSeg}).subscribe((result) => {
       // console.log('DATOS',result);
        
      }, error => {
        
        console.log(error);
      });

   
    // this.clearInterval();
      return;
    }

   

   
    if (this.isActive2) {
      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg=this.countSeg+differenceInSeconds;
     // console.log(`register: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      //console.log(this.countSeg);


    } 
    else {
     // console.log('register: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }

  
  async obtainActualLoc() {
    console.log("Cargando función...");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>");
    
    try {
      // Usamos la API de geolocalización de Capacitor para obtener las coordenadas del dispositivo
      const position = await Geolocation.getCurrentPosition();
  
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
  
      console.log('Latitud:', lat);
      console.log('Longitud:', lng);
      await this.getCountryFromCoordinates(lat, lng);
    
    }
   catch (error) {
    console.error('Error al obtener la ubicación:', error);
    this.form.get('actual').patchValue('Error al obtener la ubicación');
  }
}

/*
async getCountryFromCoordinates(lat: number, lng: number) {
  console.log("Obteniendo el país para las coordenadas:", lat, lng);

  // Usamos la geocodificación de Google para obtener la dirección a partir de las coordenadas
  const geocoder = new google.maps.Geocoder();
  const latlng = { lat, lng };

  geocoder.geocode({ 'location': latlng }, (results, status) => {
    if (status === google.maps.GeocoderStatus.OK) {
      if (results[0]) {
        // Recorremos los resultados de la geocodificación para encontrar el país
        for (let i = 0; i < results[0].address_components.length; i++) {
          for (let j = 0; j < results[0].address_components[i].types.length; j++) {
            if (results[0].address_components[i].types[j] === "country") {
              const country = results[0].address_components[i].long_name;
              console.log('País:', country);
              this.form.get('actual').patchValue(country); // Actualizamos el formulario con el país
            }
          }
        }
      } else {
        console.log("No se encontró la dirección.");
      }
    } else {
      console.error("Error en la geocodificación: " + status);
    }
  });
}*/


async getCountryFromCoordinates(lat: number, lng: number) {
  console.log("Obteniendo el país para las coordenadas:", lat, lng);

  // Configurar el idioma como inglés en la geocodificación
  const geocoder = new google.maps.Geocoder();
  const latlng = { lat, lng };

  geocoder.geocode({ location: latlng, language: 'en' }, (results, status) => {
    if (status === google.maps.GeocoderStatus.OK) {
      if (results[0]) {
        // Recorremos los resultados de la geocodificación para encontrar el país
        for (let i = 0; i < results[0].address_components.length; i++) {
          for (let j = 0; j < results[0].address_components[i].types.length; j++) {
            if (results[0].address_components[i].types[j] === "country") {
              const country = results[0].address_components[i].long_name;
              console.log('Country:', country); // Ahora está en inglés
              this.form.get('country').patchValue(country); // Actualizamos el formulario con el país en inglés
              this.form.get('lat').patchValue(lat);
              this.form.get('lng').patchValue(lng);
            }
          }
        }
      } else {
        console.log("No se encontró la dirección.");
      }
    } else {
      console.error("Error en la geocodificación: " + status);
    }
  });
}

  

}

