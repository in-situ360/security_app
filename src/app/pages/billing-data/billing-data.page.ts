import { Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { NavController, Platform } from '@ionic/angular';
import { UserBillingData } from 'src/app/models/UserBillingData';
import { ApiService } from 'src/app/services/api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { codeErrors, confirmPassword } from 'src/app/utils/utils';

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

declare var google; //GOOGLEPLACE

@Component({
  selector: 'app-billing-data',
  templateUrl: './billing-data.page.html',
  styleUrls: ['./billing-data.page.scss'],
})
export class BillingDataPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;
  form: FormGroup;
  public typeUser: String = 'Personal';
  public isCheckSelected: boolean = false;
  submitted: boolean = false;
  password_type1: string = 'password';
  password_type2: string = 'password';

  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  isChargeLoading:boolean=false;

  //---------------------------------------

  public actual:any='';
  public language_code:string='en'; 
  public originalActual: string = '';
  public selectedPlace: boolean = false;


  constructor(
    private apiService: ApiService,
    private ngZone:NgZone,
    private utilitiesService: UtilitiesService,
    private navCtrl: NavController,
    private auth: AuthenticationService,
    private platform: Platform,
    private translate: TranslateService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
  ) {
    // Detectar si es Android o iOS
    this.isIOS = this.platform.is('ios');
    this.isAndroid = this.platform.is('android');

    // Definición del formulario


    this.form = new FormGroup({
        name: new FormControl('', { validators: [Validators.required, Validators.minLength(3)] }),
        address: new FormControl('', { validators: [Validators.required] }),
        email: new FormControl('', { validators: [Validators.required, Validators.email, this.advancedEmailValidator2()/*,this.validEmailExtension()*/] }),
        entity_identification: new FormControl('', { validators: [Validators.required] }),
        province: new FormControl('', { validators: [Validators.required] }),
        city: new FormControl('', { validators: [Validators.required] }),
        zip_code: new FormControl('', { validators: [Validators.required] }) 
    });
     
      
   
  }

  ngOnInit() {
   
    this.apiService.getEntity('UserBillingData').subscribe(
      (userBillingData: UserBillingData) => {
        console.log('BillingData:',userBillingData);
        // Al inicializar el formulario, cargar los datos del usuario
        this.form.patchValue({
          name: userBillingData.name,
          email: userBillingData.email,
          address:userBillingData.address,
          entity_identification:userBillingData.entity_identification,
          province:userBillingData.province,
          city:userBillingData.city,
          zip_code:userBillingData.zip_code,
        });

        this.originalActual = userBillingData.address;

        this.initAutocomplete();
      },
      async error => {
        const toastMensaje = await this.translate.get("profile-settings.Error obteniendo el usuario").toPromise();
        this.utilitiesService.showToast(toastMensaje); 
        this.initAutocomplete();
        
      }
    );
  }



  ionViewDidEnter() {
    console.log(this.translate.langs.length);
  
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



   
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    
  }




  // Validador personalizado para verificar que ambas contraseñas coincidan si están presentes
  passwordsMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const password_confirmation = group.get('password_confirmation')?.value;
  
    console.log('');
    // 
    if (!password && !password_confirmation) {
      console.log('Si ambos campos están vacíos, no hay error');
      return null;
    }
  
    // 
    if (password !== password_confirmation) {
      console.log('Si solo uno de los campos tiene valor o no coinciden, devolver un error');
      return { passwordsDoNotMatch: true };
    }
  
    // 
    console.log('Si las contraseñas coinciden, no hay error');
    return null;
  }
  

  submitForm() {
    // Verificar si hay algún valor en las contraseñas; si no hay, no enviar las contraseñas al backend
    const formValue = { ...this.form.value };


    if(!this.selectedPlace) {
    console.log("No se seleccionó una dirección válida, restaurando valor anterior seleccionado.");
    this.form.get('address').patchValue(this.originalActual);
  }
    

    this.isChargeLoading=true;



    // Actualizar los datos del usuario en el backend
    this.apiService.updateUserBillingData(this.form.value).subscribe(async (result) => {
      this.isChargeLoading=false;
        // Emitir cambios y volver a la pantalla anterior
       
        this.navCtrl.pop();
       
        const toastMensaje = await this.translate.get("Datos de facturación actualizados").toPromise();
        this.utilitiesService.showToast(toastMensaje); 
        
      },
      async error => {
        this.isChargeLoading=false;
        const toastMensaje = await this.translate.get("codeErrors."+codeErrors(error)).toPromise();
        this.utilitiesService.showToast(toastMensaje); 
      }
    );
  }


  goBack(){
    this.navCtrl.pop();

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

  validateAndSubmit(): void {
    this.submitted = true; // Activa la visualización de errores
    if (this.form.valid) {
      this.submitForm();
    } else {
     // this.utilitiesService.showToast('Por favor, revisa los campos con errores antes de continuar.');
    }
  }





















  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
        console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
        const currentRoute = this.router.url;
        if(currentRoute.includes('/profile-settings')){
          console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
          // this.startInterval();
        }
      }
      else{
        // this.clearInterval();

      }
      
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Verifica si la ruta actual no es '/UserSearch'
        if (!event.url.includes('/profile-settings')) {
         // console.log('Saliendo de UserSearchPage, limpiando intervalos');
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

    if(this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
      console.log("Suscripción al router cancelada correctamente");
    }

    if (this.interval) {

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:23,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`profile-settings: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:23,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`profile-settings: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('profile-settings: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }




  initAutocomplete() { 


    

    const input = document.getElementById('searchTextField')as HTMLInputElement;
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      console.log('Dirección:', input.value);
      

     
      this.form.get('address').patchValue(input.value); 
      this.originalActual=input.value;
      console.log('originalActual',this.originalActual);
      
      this.selectedPlace = true;
     


    });


    // Reset flag on manual input
    input.addEventListener('input', () => {
      this.selectedPlace = false;
    });
  }



  onInputLocation(event: Event) {
      const inputElement = event.target as HTMLInputElement;
      const value = inputElement.value.trim();
    
      // Si el campo está vacío, actualizamos el array con un valor vacío
      if (!value) {
        console.log('Localización actual vacia');
        //this.actual= '';
        this.form.get('lat').patchValue('');
        this.form.get('lng').patchValue('');
        this.form.get('address').patchValue(''); 

      } 
    }


}
