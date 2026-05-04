import { Component, NgZone, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core'; //MULTI LENGUAJE
import { User } from 'src/app/models/User';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { codeErrors } from 'src/app/utils/utils';
import { AllImageCropperPage } from '../all-image-cropper/all-image-cropper.page';
import { InfoModalPage } from '../info-modal/info-modal.page';

import { NavigationEnd, Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Subscription } from 'rxjs';

import pica from 'pica';

import { ViewChild } from '@angular/core';
import { IonInput } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';

declare var google; //GOOGLEPLACE

interface CustomRangeValue {
  lower: number;
  upper: number;
}

@Component({
  selector: 'app-finish-register',
  templateUrl: './finish-register.page.html',
  styleUrls: ['./finish-register.page.scss'],
})
export class FinishRegisterPage implements OnInit {
  rangeValue: any = 100;

  isAndroid: boolean = false;
  isIOS: boolean = false;
  show: boolean = true;

  isSurname1Valid: boolean = false;
  isRepresentativeNameValid = false;
  submitted: boolean = false;

  placeholderName: string;
  public ruta: string = 'assets/icon/user-rosa.svg';

  //public newTagNames:any=[];
  public deleteTagIds: any = [];
  public typeUser = 'Personal';
  public user: User;
  public form: FormGroup;
  public loginForm: any; //lo que viene de las otras paginas
  public base64img: string;

  chips = [
    { id: 1, label: 'Fotografía', showLabel: '', selected: false },
    { id: 2, label: 'Cine/Video', showLabel: '', selected: false },
    { id: 3, label: 'TV', showLabel: '', selected: false },
    { id: 4, label: 'Música', showLabel: '', selected: false },
    { id: 5, label: 'Eventos', showLabel: '', selected: false },
    { id: 6, label: 'Teatro', showLabel: '', selected: false },
    { id: 7, label: 'Otros', showLabel: '', selected: false },
    { id: 8, label: 'Sin categoría', showLabel: '', selected: false },
  ];

  public tags: any = [];
  public categoryIds: any = [];
  prons: any[] = [];

  //SEGUIMIENTO DE TIEMPO
  private interval: any = null;
  private countSeg: number;
  private previousDate: Date | null = null;
  private isActive2: boolean = true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  public actual: any = '';
  public originalActual: string = '';
  public originalLat: any = '';
  public originalLng: any = '';
  public selectedPlace: boolean = false;

  isChargeLoading: boolean = false;

  @ViewChild('tagInputRef', { static: false }) tagInputRef: IonInput;
  keyboardVisible = true;

  constructor(
    private auth: AuthenticationService,
    private utilities: UtilitiesService,
    private ngZone: NgZone,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private apiService: ApiService,
    private api: ApiService,
    private platform: Platform,
    private translate: TranslateService,
    private router: Router, //SEGUIMIENTO DE TIEMPO
    private modalController: ModalController,
  ) {
    this.isIOS = this.platform.is('ios');
    this.isAndroid = this.platform.is('android');
    this.placeholderName = this.translate.instant('Nombre') + '*';
    //const toastMensaje = await this.translate.get("register.Por favor, revisa los campos con errores antes de continuar").toPromise();

    if (history.state.loginForm) {
      //const loginForm = history.state.loginForm;
      this.loginForm = history.state.loginForm;
      console.log('FORMULARIO DE LOGIN:', this.loginForm);
      //this.formOrden.get('bestValued')?.setValue(this.loginForm['bestValued']);*/
      this.typeUser = this.loginForm['typeUser'];

      console.log('--->', this.typeUser);
      if (this.typeUser != 'Empresa') {
        this.typeUser = 'Personal';

        const toastMensaje = this.translate.instant('finish-profile.Nombre');

        this.placeholderName = toastMensaje + '*';

        // this.utilities.showToast('-->'+this.placeholderName);

        this.ruta = 'assets/icon/user-rosa.svg';
      } else if (this.typeUser == 'Empresa') {
        this.typeUser = 'Empresa';
        this.ruta = 'assets/icons/business.svg';

        const toastMensaje = this.translate.instant('Nombre de Compañía');
        this.placeholderName = toastMensaje + '*';
        //this.utilities.showToast('-->'+this.placeholderName);
      }
    }

    this.form = new FormGroup(
      {
        avatar: new FormControl('', { validators: [Validators.required] }),
        role_id: new FormControl('2'),
        name: new FormControl(this.loginForm['name'] + '', {
          validators: [Validators.required, Validators.minLength(3)],
        }),
        surname1: new FormControl(this.loginForm['surname1'] + ''),
        gender: new FormControl(''),
        email: new FormControl(this.loginForm['email'] + ''),
        surname2: new FormControl(this.loginForm['surname2'] + ''),
        source: new FormControl(this.loginForm['source'] + ''),
        country: new FormControl(this.loginForm['country'] + ''),
        typeUser: new FormControl(this.loginForm['typeUser'] + ''),
        password: new FormControl(this.loginForm['password'] + ''),
        password_confirmation: new FormControl(
          this.loginForm['password_confirmation'] + '',
        ),
        hide_my_user: new FormControl(false),
        representativeName: new FormControl(
          this.loginForm['representativeName'] + '',
        ),
        price: new FormControl(100),
        proffesion: new FormControl('', { validators: [Validators.required] }),
        birthdate: new FormControl('', {
          validators: [Validators.required, this.pastDateValidator()],
        }),
        description: new FormControl(''),
        tagInputValue: new FormControl(''),
        //deleteTagIds: new FormControl(this.deleteTagIds),
        tags: new FormControl(this.tags),
        pronInputValue: new FormControl(''),
        prons: new FormControl(this.prons),
        categoryIds: new FormControl(this.categoryIds, {
          validators: [this.categoryIdsValidator],
        }),
        actual: new FormControl('', { validators: [Validators.required] }),
        lat: new FormControl('', [Validators.required]),
        lng: new FormControl('', [Validators.required]),
        isCompleteRegister: new FormControl(true, [Validators.required]),
        language_code: new FormControl('en'),
      },
      {
        /*validators: this.surnameValidator */
        //validators:this.genderAndPronValidator
        validators: Validators.compose([
          this.surnameValidator,
          this.genderAndPronValidator,
        ]),
      },
    );
    //this.form.get('deleteTagIds').patchValue(this.deleteTagIds);
    //this.form.get('newTagNames').patchValue(this.newTagNames);

    //this.initAutocomplete();
  }

  async requestCameraPermission() {
    const cameraPermissions = await Camera.checkPermissions();
    if (
      cameraPermissions.camera !== 'granted' ||
      cameraPermissions.photos !== 'granted'
    ) {
      console.log('NO TIENE PERMISOS!!!!:');
      const permissions = await Camera.requestPermissions();

      if (permissions.photos === 'denied' || permissions.camera === 'denied') {
        console.warn('Permiso de cámara o fotos denegado:', permissions);
      } else {
        console.log('Permiso de cámara OK:', permissions);
      }
    }
  }

  ngAfterViewInit() {
    // this.requestCameraPermission();
    this.initAutocomplete();
  }

  ngOnInit() {
    // this.utilities.showToast(this.loginForm['typeUser']);
    /*Keyboard.addListener('keyboardWillShow', () => {
        this.keyboardVisible = true;
      });*/
    //Keyboard.addListener('keyboardWillHide', () => {
    //this.keyboardVisible = false;
    //});
    /*Keyboard.addListener('keyboardDidShow', () => {
      this.keyboardVisible = true;
    });
  
    Keyboard.addListener('keyboardDidHide', () => {
      this.keyboardVisible = false;
    });*/
    /* this.show=true;
        console.log(history.state.isFromLogin);
        if(history.state.isFromLogin){
          console.log('ocultando');
          this.show=false;
        }
  
      console.log('>>>>>');
      this.rangeValue=100;
  
      this.apiService.getEntity('user').subscribe(
        (user: User) => {
          this.user = user;
          console.log(">>>>>>>>>");
          console.log(this.user);
  
  
          this.form.get('gender').setValue('2');
  
  
          if(this.user.user_type_id==1){
            this.typeUser='Personal';
          }
          else if(this.user.user_type_id==2){
            this.typeUser='Empresa';
          }
          
          this.form.patchValue(user);
          this.rangeValue=this.form.get('price').value;
          console.log(this.form.get('price').value);
  
          console.log('Holaaaa', this.user);
          this.inicializateTag();
         // this.isLoading = false;
  
  
         if (this.user.allmycategories) {
          this.user.allmycategories.forEach((category: string) => {
            // Buscar el chip que coincida con la categoría y marcarlo como seleccionado
            const chip = this.chips.find(chip => chip.label.toLowerCase() === category.toLowerCase());
            if (chip) {
              chip.selected = true;
              this.categoryIds.push(chip.id);
              chip.showLabel = this.translate.instant(chip.label);
            }
          });
        }
  
  
        },
        error => {
         // this.utilities.showToast('Error obteniendo el usuario');
  
          this.translate.get('Error obteniendo el usuario').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
          //this.isLoading = false;
        }
      );*/
  }

  initAutocomplete() {
    const input = document.getElementById(
      'searchTextField',
    ) as HTMLInputElement;

    if (!input) {
      console.warn('No se encontró el input searchTextField');
      return;
    }

    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
      console.warn('Google Places no está disponible todavía');
      return;
    }

    const autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
          console.warn('La dirección seleccionada no tiene coordenadas');

          this.form.get('lat')?.patchValue('');
          this.form.get('lng')?.patchValue('');
          this.form.get('lat')?.updateValueAndValidity();
          this.form.get('lng')?.updateValueAndValidity();

          this.selectedPlace = false;
          return;
        }

        const address = input.value;
        const lat = place.geometry.location.lat() + '';
        const lng = place.geometry.location.lng() + '';

        this.form.get('actual')?.patchValue(address);
        this.form.get('lat')?.patchValue(lat);
        this.form.get('lng')?.patchValue(lng);

        this.originalActual = address;
        this.originalLat = lat;
        this.originalLng = lng;
        this.selectedPlace = true;

        this.form.get('actual')?.updateValueAndValidity();
        this.form.get('lat')?.updateValueAndValidity();
        this.form.get('lng')?.updateValueAndValidity();

        console.log('Dirección seleccionada:', address);
        console.log('Lat:', lat);
        console.log('Lng:', lng);
      });
    });

    input.addEventListener('input', () => {
      this.ngZone.run(() => {
        this.selectedPlace = false;

        this.form.get('lat')?.patchValue('');
        this.form.get('lng')?.patchValue('');

        this.form.get('lat')?.updateValueAndValidity();
        this.form.get('lng')?.updateValueAndValidity();
      });
    });
  }

  /*
    initAutocomplete() { 
  
      
  
      const input = document.getElementById('searchTextField')as HTMLInputElement;
      const autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        console.log('Dirección:', input.value);
        
        console.log('Coordenadas:', place.geometry.location.lat(), place.geometry.location.lng());
  
        this.form.get('lat').patchValue(place.geometry.location.lat()+'');
        this.form.get('lng').patchValue(place.geometry.location.lng()+'');
        this.form.get('actual').patchValue(input.value); 
        this.originalActual=input.value;
        this.originalLat=place.geometry.location.lat()+'';
        this.originalLng=place.geometry.location.lng()+'';
        this.selectedPlace = true;
       
  
  
      });
  
  
      // Reset flag on manual input
      input.addEventListener('input', () => {
        this.selectedPlace = false;
      });
    }*/

  onInputLocation(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value.trim();

    // Si el campo está vacío, actualizamos el array con un valor vacío
    if (!value) {
      console.log('Localización actual vacia');
      //this.actual= '';
      this.form.get('lat').patchValue('');
      this.form.get('lng').patchValue('');
      this.form.get('actual').patchValue('');
    }
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.form.patchValue({ language_code: language });
  }

  async ionViewDidEnter() {
    console.log(this.translate.langs.length);

    this.utilities.getLang().then(async (result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo == null) {
        console.log('No idioma');
        this.utilities.saveLang('en');
        // const toastMensaje = await this.translate.get("finish-profile.Nombre").toPromise();
        //this.placeholderName = toastMensaje + '*';
      } else {
        this.switchLanguage(prefijo || 'en');
      }
    });

    this.chips.forEach((chip) => {
      chip.showLabel = this.translate.instant(chip.label);
    });
    console.log('ionViewWillEnter()');
    this.show = true;

    console.log('>>>>>');
    this.rangeValue = 100;

    /* if(this.loginForm['bestValued']=='Personal'){
            this.typeUser='Personal';
           
            const toastMensaje = await this.translate.get("finish-profile.Nombre").toPromise();
            this.placeholderName = toastMensaje + '*';
            
            this.ruta='assets/icon/user-rosa.svg';
          }
          else if(this.loginForm['bestValued']=='Empresa'){
            this.typeUser='Empresa';
            this.ruta='assets/icons/business.svg';
            
            const toastMensaje = await this.translate.get("finish-profile.Nombre Empresa").toPromise();
            this.placeholderName = toastMensaje + '*';
          }*/

    //meter aqui valores de formulario

    this.rangeValue = this.form.get('price').value;
    console.log(this.form.get('price').value);

    this.form.get('tags').patchValue(this.tags);
    console.log(this.form.get('tags'));
    this.form.get('tagInputValue')?.setValue('');

    //this.inicializateTag();

    if (this.user.allmycategories) {
      this.user.allmycategories.forEach((category: string) => {
        // Buscar el chip que coincida con la categoría y marcarlo como seleccionado
        const chip = this.chips.find(
          (chip) => chip.label.toLowerCase() === category.toLowerCase(),
        );
        if (chip) {
          chip.selected = true;
          this.categoryIds.push(chip.id);
          this.form.get('categoryIds')?.updateValueAndValidity();
          //chip.showLabel = this.translate.instant(chip.label);
        }
        /*else{
              chip.showLabel = this.translate.instant(chip.label);
            }*/
      });
    }

    this.form.get('prons')?.patchValue([]); // Actualizar el formulario

    let actlo = '';
    this.originalActual = '';
    this.originalLat = '';
    this.originalLng = '';

    this.form.get('lat').patchValue('');
    this.form.get('lng').patchValue('');
    this.form.get('actual').patchValue('');
  }

  onGenderChange(event: any) {
    const selectedValue = event.detail.value;
    if (selectedValue !== '4') {
      this.form.get('newPron')?.setValue('');
    }
  }

  /* categoryIdsValidator(control: AbstractControl): { [key: string]: any } | null {
    const categoryIds = control.value;
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      return null; // ✅ Válido
    } else {
      return { categoryIdsEmpty: true }; // ❌ Error si no hay tags
    }
  }*/

  categoryIdsValidator: ValidatorFn = (
    _control: AbstractControl,
  ): ValidationErrors | null => {
    if (Array.isArray(this.categoryIds) && this.categoryIds.length > 0) {
      return null;
    } else {
      return { categoryIdsEmpty: true };
    }
  };

  surnameValidator: ValidatorFn = (
    control: AbstractControl,
  ): { [key: string]: any } | null => {
    const typeUser = 'Personal';
    const surname1 = control.get('surname1');
    const surname2 = control.get('surname2');
    const representativeName = control.get('representativeName');

    if (this.typeUser == 'Personal') {
      const isSurname1Valid = surname1 && surname1.value.trim() !== '';

      if (!isSurname1Valid) {
        console.log('surnames no validos');
        this.isSurname1Valid = true;
        return { surnameRequired: true };
      } else {
        this.isSurname1Valid = false;
      }
    }

    if (this.typeUser == 'Empresa') {
      const isRepresentativeNameValid = representativeName.value.trim() !== '';
      if (!isRepresentativeNameValid) {
        console.log('nombre empresa no valido');
        return { representativeNameRequired: true };
      } else {
        this.isRepresentativeNameValid = false;
      }
    }
    //console.log(typeUser.value);
    console.log('-------');

    return null;
  };

  onIonChange(event: any) {
    this.rangeValue = event.detail.value;
    console.log('Rango seleccionado:', this.rangeValue);
  }

  goBack() {
    this.navCtrl.pop();
  }

  public async adjuntarImagen() {
    // Detectar si estamos en plataforma web
    if (Capacitor.isNativePlatform()) {
      // Funcionalidad para plataformas nativas (iOS/Android)
      await this.adjuntarImagenNativa();
    } else {
      // Funcionalidad para web
      this.adjuntarImagenWeb();
    }
  }

  private async adjuntarImagenNativa() {
    const permissions = await Camera.requestPermissions();

    if (permissions.photos === 'denied' || permissions.camera === 'denied') {
      console.log('permiso camera ', permissions);
      return;
    }

    const image = await Camera.getPhoto({
      promptLabelHeader: 'Fotos',
      promptLabelCancel: 'Cancelar',
      promptLabelPhoto: 'Galería',
      promptLabelPicture: 'Cámara',
      quality: 1,
      allowEditing: true,
      resultType: CameraResultType.Base64,
    });

    console.log(image);

    this.base64img = 'data:image/jpeg;base64,' + image.base64String;

    const base64String = image.base64String || '';
    const length = base64String.length;
    const padding = (base64String.match(/=/g) || []).length;

    const tamañoEnBytes = (length * 3) / 4 - padding;
    const tamañoEnKB = (tamañoEnBytes / 1024).toFixed(2);

    console.log(
      `El tamaño de la imagen es: ${tamañoEnBytes} bytes (${tamañoEnKB} KB)`,
    );

    this.form.patchValue({ avatar: this.base64img });
    this.openAllImageCropper(true);
  }

  private adjuntarImagenWeb() {
    // Crear input file temporal para web
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.base64img = e.target.result;
          this.form.patchValue({ avatar: this.base64img });
          this.openAllImageCropper(true);
        };
        reader.readAsDataURL(file);
      }
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  toggleSelection(index: number) {
    if (index === this.chips.length - 1) {
      // Si se selecciona el último chip, deseleccionar todos los demás
      this.chips.forEach((chip, i) => {
        if (i !== index) {
          chip.selected = false;
          const idIndex = this.categoryIds.indexOf(chip.id);
          if (idIndex !== -1) {
            this.categoryIds.splice(idIndex, 1);
          }
        }
      });
    } else {
      // Si se selecciona cualquier otro chip, deseleccionar el último chip
      this.chips[this.chips.length - 1].selected = false;
      const lastChipIdIndex = this.categoryIds.indexOf(
        this.chips[this.chips.length - 1].id,
      );
      if (lastChipIdIndex !== -1) {
        this.categoryIds.splice(lastChipIdIndex, 1);
      }
    }

    // Cambiar el estado del chip seleccionado
    this.chips[index].selected = !this.chips[index].selected;

    // Añadir o eliminar el ID del chip seleccionado de categoryIds
    if (this.chips[index].selected) {
      this.categoryIds.push(this.chips[index].id);
    } else {
      const idIndex = this.categoryIds.indexOf(this.chips[index].id);
      if (idIndex !== -1) {
        this.categoryIds.splice(idIndex, 1);
      }
    }

    console.log(this.categoryIds);
    this.form.get('categoryIds').patchValue(this.categoryIds);
    this.form.get('categoryIds')?.updateValueAndValidity();
  }

  submitForm() {
    //this.utilities.showLoading('');
    this.isChargeLoading = true;

    if (!this.selectedPlace) {
      console.log(
        'No se seleccionó una dirección válida, restaurando valor original.',
      );
      this.form.get('actual').patchValue(this.originalActual);
      this.form.get('lat').patchValue(this.originalLat + '');
      this.form.get('lng').patchValue(this.originalLng + '');
    }

    this.apiService.updateUser(this.form.value).subscribe(
      async (user: User) => {
        this.user = user;
        this.apiService.userChanges2.next();

        //this.utilities.dismissLoading();
        this.isChargeLoading = false;
        if (this.show) {
          this.navCtrl.navigateRoot('/tabs/my-profile');
        } else {
          this.navCtrl.navigateForward('/tabs/home');
        }
        console.log('se termino bien');
        console.log(user);
        const toastMensaje = await this.translate
          .get('finish-profile.Usuario actualizado correctamente')
          .toPromise();
        this.utilities.showToast(toastMensaje);
      },
      (error) => {
        //this.utilities.dismissLoading();
        this.isChargeLoading = false;
        this.utilities.showToast(this.translate.instant(codeErrors(error)));
      },
    );
  }

  async submitFormToLogin() {
    const toastMensaje = await this.translate
      .get('register.Registrando usuario')
      .toPromise();

    this.isChargeLoading = true;

    console.log('Datos enviados al registro:', this.form.value);

    this.apiService.register(this.form.value).subscribe(
      async (user: User) => {
        this.apiService.setFromRegister(1);
        this.isChargeLoading = false;

        this.apiService.login(this.form.value).subscribe(
          async (user: User) => {
            console.log(user);

            this.utilities.saveUserId(user.id);

            this.apiService.setTokenToHeaders(user.api_token);

            await this.auth.login(user.api_token);
          },
          (error) => {
            this.isChargeLoading = false;

            if (error.status) {
              console.log('Error status login:', error.status);
              this.utilities.showToast(codeErrors(error));
            } else {
              console.log('Error login:', error);
              this.utilities.showToast(codeErrors(error));
            }
          },
        );
      },
      (error) => {
        this.isChargeLoading = false;

        console.log('Error registro:', error);
        this.utilities.showToast(codeErrors(error));
      },
    );
  }

  /*
  async submitFormToLogin() {
    const toastMensaje = await this.translate
      .get('register.Registrando usuario')
      .toPromise();

    this.isChargeLoading = true;

    this.apiService.register(this.form.value);

    this.apiService.register(this.form.value).subscribe(
      async (user: User) => {
        this.apiService.setFromRegister(1);
        //this.utilitiesService.dismissLoading();
        this.isChargeLoading = false;
        this.apiService.login(this.form.value).subscribe(
          async (user: User) => {
            console.log(user);
            this.utilities.saveUserId(user.id); //--------guardo id tmabien tras registrarse
            //Ahora aplicamos la cabecera devuelta a las siguientes peticiones
            this.apiService.setTokenToHeaders(user.api_token);
            //Vamos a inicio
            await this.auth.login(user.api_token);
          },
          (error) => {
            if (error.status) {
              // Capturar el error.status aquí y manejarlo según tus necesidades
              console.log('Error status:', error.status);
              this.isChargeLoading = false;
              this.utilities.showToast(codeErrors(error));
            }
          },
        );
      },
      (error) => {
        this.isChargeLoading = false;
        this.utilities.showToast(codeErrors(error));
      },
    );
  }
  */

  /*cambioGratis(){
  
  
      this.utilities.showLoading('Cargando...');
  
  
      this.apiService.cambioGratis({nuevaSub:this.suscriptionSelected.id}).subscribe((result) => {
        console.log('Result',result);
  
  
  
        this.utilities.dismissLoading();
  
  
        
        //this.utilities.showToast("Suscripción cambiada");
        this.modalDescript = `Suscripción cambiada con éxito`;
        this.setOpen(true);
  
        
      
      }, error => {
        this.utilities.dismissLoading();
        this.utilities.showToast("Hubo un problema para subir el vehículo");
        console.log(error);
        
        
      });
    }*/

  async createTag() {
    console.log(this.form.get('tagInputValue')?.value);

    const tag = this.form.get('tagInputValue')?.value.trim();
    const tag2 = this.form.get('tagInputValue')?.value.trim().toLowerCase();
    if (tag) {
      if (!this.tags.map((tag) => tag.toLowerCase()).includes(tag2)) {
        this.tags.push(tag);
        this.form.get('tags').patchValue(this.tags);
        console.log(this.form.get('tags'));
        this.form.get('tagInputValue')?.setValue('');
        //this.form.get('tagInputValue')?.reset();
      } else {
        console.log('Ya hay un Tag con ese valor.');
        const toastMensaje = await this.translate
          .get('finish-profile.Ya hay un Tag con ese valor')
          .toPromise();
        this.utilities.showToast(toastMensaje);
      }
    } else {
      const toastMensaje = await this.translate
        .get('finish-profile.El campo está vacío, no se puede crear un Tag')
        .toPromise();
      this.utilities.showToast(toastMensaje);
    }
  }

  deleteTag(tag: string) {
    this.tags = this.tags.filter((t) => t !== tag);
    this.form.get('tags')?.patchValue(this.tags);
  }

  /*inicializateTag(){
  
      console.log(this.form.get('tagInputValue')?.value);
  
      console.log('all_labels:(primero) ',this.user.allmylabels);
  
      if(this.user?.translateUserLabels?.length){
        console.log("hay traducciondes de tags de usurio");
        this.user.allmylabels=this.user?.translateUserLabels;
      }
     
      this.user.allmylabels.forEach((label: any) => {
        // Agregar el valor del campo 'value' al array labelValues
       // labelValues.push(label.value);
      
      
      const tag=label.value;
      
        
  
      console.log('all_labels: ',this.user.allmylabels)
        
  
        this.tags.push(tag);
        this.form.get('tags').patchValue(this.tags);
        console.log(this.form.get('tags'));
        this.form.get('tagInputValue')?.setValue('');
        //this.form.get('tagInputValue')?.reset();
        
        
      });
  
    }*/

  /*inicializateTypeCategories(){
  
      this.user.allmylabels.forEach((label: any) => {
      });
    }*/

  async abrirModalInfo() {
    const modal = await this.modalCtrl.create({
      component: InfoModalPage,
      cssClass: 'InfoModal',
      componentProps: {
        /* district: this.charge.mesaControl.district,*/
      },
      // backdropDismiss:false
    });
    return await modal.present();
  }

  async openAllImageCropper($newImage: boolean) {
    console.log('>>>>>>>>>>>>');

    if (this.base64img == null || this.base64img == '') {
      return;
    }

    const imageRuta = this.base64img;
    //console.log(this.user.avatar);

    const newImage = $newImage;

    //if(this.isImageFile(imageRuta)){

    console.log('>>>>>>>>>>>>2');
    const modal = await this.modalController.create({
      component: AllImageCropperPage,
      componentProps: { imageRuta, newImage },
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        console.log('Cropped Image:', result.data);

        if (result.data.croppedImageFile != null) {
          this.base64img = result.data.croppedImageFile;

          console.log('dios que funcione>>>>>>>>>>>>');

          console.log(this.base64img);
          //this.rutaImagen =this.base64img;

          this.form.patchValue({ avatar: this.base64img });
          // this.user.avatar = this.base64img;
          //this.form.patchValue({image : this.base64img})
        }
      }
    });

    return await modal.present();
    // }
    //else{
    //console.log('No es una imagen');
    //}
  }

  pastDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const date = control.value;
      const currentDate = new Date();

      // Asegúrate de que la fecha no sea nula ni indefinida
      if (!date) return null;

      const inputDate = new Date(date);

      // Compara la fecha proporcionada con la fecha actual
      if (inputDate >= currentDate) {
        return { pastDate: true };
      }

      return null;
    };
  }

  /*validateAndSubmit(): void {
      this.submitted = true; // Activa la visualización de errores
      if (this.form.valid) {
        this.submitForm();
      } else {
        console.log("control validar");
        console.log(this.form.valid);
        // Recorre todos los controles y muestra los errores de cada uno
      Object.keys(this.form.controls).forEach(controlName => {
        const control = this.form.get(controlName);
        if (control && control.invalid) {
          console.log(`${controlName} is invalid. Errors: `, control.errors);
        }
      });
        //this.utilitiesService.showToast('Por favor, revisa los campos con errores antes de continuar.');
      }
    }*/

  /*
  async validateAndSubmit(): Promise<void> {
    this.submitted = true; // Marca el formulario como enviado

    if (this.form.invalid) {
      console.log('Formulario inválido:', this.form.errors);

      const toastMensaje = await this.translate
        .get(
          'finish-profile.Por favor, revisa los campos con errores antes de continuar',
        )
        .toPromise();
      this.utilities.showToast(toastMensaje);
      return; // Detener el proceso si hay errores
    }

    // Si todo está correcto, enviar el formulario
    // this.submitForm();
    this.submitFormToLogin();
  }*/

  async validateAndSubmit(): Promise<void> {
    this.submitted = true;
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      console.log('Formulario inválido');
      console.log('Errores globales del formulario:', this.form.errors);

      Object.keys(this.form.controls).forEach((controlName) => {
        const control = this.form.get(controlName);

        if (control?.invalid) {
          console.log(`Campo inválido: ${controlName}`, {
            value: control.value,
            errors: control.errors,
          });
        }
      });

      const toastMensaje = await this.translate
        .get(
          'finish-profile.Por favor, revisa los campos con errores antes de continuar',
        )
        .toPromise();

      this.utilities.showToast(toastMensaje);
      return;
    }

    this.submitFormToLogin();
  }

  // Crear un pronombre
  async createPron() {
    const pron = (this.form.get('pronInputValue')?.value || '').trim(); // Pronombre ingresado
    const pronLower = pron.toLowerCase(); // Normalizado para evitar duplicados
    if (pron) {
      if (!this.prons.map((p) => p.toLowerCase()).includes(pronLower)) {
        // Si no está duplicado, añadirlo a la lista
        this.prons.push(pron);
        this.form.get('prons')?.patchValue(this.prons);
        this.form.get('pronInputValue')?.setValue(''); // Limpiar el campo
      } else {
        // Mostrar error de duplicado

        const toastMensaje = await this.translate
          .get('finish-profile.Ya hay un Pronombre con ese valor')
          .toPromise();
        this.utilities.showToast(toastMensaje);
      }
    } else {
      // Mostrar error de campo vacío

      const toastMensaje = await this.translate
        .get(
          'finish-profile.El campo está vacío, no se puede crear un Pronombre',
        )
        .toPromise();
      this.utilities.showToast(toastMensaje);
    }
  }

  // Eliminar un pronombre
  deletePron(pron: string) {
    this.prons = this.prons.filter((p) => p !== pron); // Filtrar el pronombre eliminado
    this.form.get('prons')?.patchValue(this.prons); // Actualizar el campo en el formulario
  }

  ionViewWillEnter() {
    console.log('SE EJECUTA ionViewWillEnter');

    App.addListener('appStateChange', (state) => {
      console.log('se lanza evento ACTIVO/INACTIVO');
      this.isActive2 = state.isActive;
      if (this.isActive2) {
        const currentRoute = this.router.url;
        if (currentRoute.includes('/finish-profile')) {
          console.log('DENTRO DE IF EVENTO MODO: ACTIVO');
          // this.startInterval();
        }
      } else {
        // this.clearInterval();
      }
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Verifica si la ruta actual no es '/UserSearch'
        if (!event.url.includes('/finish-profile')) {
          // console.log('Saliendo de finish-profile, limpiando intervalos');
          // this.clearInterval();
        } else {
          // this.startInterval();
        }
      }
    });

    if (this.interval == null) {
      // this.startInterval();
    }
  }

  ionViewWillLeave() {
    console.log('Se ejecuta ionViewWillLeave');
    // this.clearInterval();
  }

  ngOnDestroy() {
    // this.clearInterval();
  }

  // Inicia el intervalo para ejecutar la función cada 5 segundos
  private startInterval() {
    this.countSeg = 0;
    this.previousDate = new Date();
    if (this.interval == null) {
      console.log(
        'INTERVAL NULL CREANDO UNO NUEVO-----------------------------------',
      );
      this.interval = setInterval(() => {
        this.checkDateDifference();
      }, 2000);
    }
  }

  // Limpia el intervalo cuando se sale de la pestaña
  private clearInterval() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
      console.log('Suscripción al router cancelada correctamente');
    }

    if (this.interval) {
      //ENVIO TIEMPO
      this.apiService
        .registerTimeScreen({ screenId: 21, screenTime: this.countSeg })
        .subscribe(
          (result) => {
            console.log('DATOS', result);
          },
          (error) => {
            console.log(error);
          },
        );

      // clearInterval(this.interval);
      //this.interval = null;
    }
    clearInterval(this.interval);
    this.interval = null;
  }

  // Calcula la diferencia entre la fecha anterior y la actual
  private checkDateDifference() {
    const currentDate = new Date();

    if (!this.isActive2) {
      const differenceInSeconds = Math.floor(
        (currentDate.getTime() - this.previousDate.getTime()) / 1000,
      );
      this.countSeg = this.countSeg + differenceInSeconds;
      // console.log(`finish-profile: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      // console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService
        .registerTimeScreen({ screenId: 21, screenTime: this.countSeg })
        .subscribe(
          (result) => {
            // console.log('DATOS',result);
          },
          (error) => {
            console.log(error);
          },
        );

      // this.clearInterval();
      return;
    }

    if (this.isActive2) {
      const differenceInSeconds = Math.floor(
        (currentDate.getTime() - this.previousDate.getTime()) / 1000,
      );
      this.countSeg = this.countSeg + differenceInSeconds;
      // console.log(`finish-profile: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      // console.log(this.countSeg);
    } else {
      // console.log('finish-profile: No hay fecha anterior, usando la actual como inicial.');
    }

    this.previousDate = currentDate;
  }

  genderAndPronValidator: ValidatorFn = (
    form: AbstractControl,
  ): ValidationErrors | null => {
    const gender = String(form.get('gender')?.value || '');
    const prons = form.get('prons')?.value || [];

    if (!['1', '2', '3', '4'].includes(gender)) {
      console.log('Género inválido o no seleccionado:', gender);
      return { genderRequired: true };
    }

    if (gender === '4' && prons.length === 0) {
      console.log('Se requieren pronombres personalizados');
      return { pronRequired: true };
    }

    return null;
  };

  /*
  genderAndPronValidator: ValidatorFn = (
    form: AbstractControl,
  ): ValidationErrors | null => {
    const gender = form.get('gender')?.value; // Obtener el valor de 'gender'
    const prons = form.get('prons')?.value || []; // Obtener los pronombres (si los hay)

    console.log('Gender:', gender); // Para depuración
    console.log('Pronouns:', prons); // Para depuración

     // if (!gender) {
     //   console.log('No gender selected'); // Depuración
     //   return { genderRequired: true }; // Error si no hay género seleccionado
     // }
    if (!['1', '2', '3', '4'].includes(gender)) {
      console.log('Invalid or no gender selected'); // Depuración
      return { genderRequired: true }; // Error si el género no es válido
    }

    if (gender === '4' && prons.length === 0) {
      console.log('Pronouns required for gender 4'); // Depuración
      return { pronRequired: true }; // Error si género es "Añade tus pronombres" pero no hay pronombres
    }

    return null; // Formulario válido
  };*/

  async redimensionarImagen(
    base64: string,
    width: number,
    height: number,
  ): Promise<string> {
    const img = new Image();
    img.src = `data:image/jpeg;base64,${base64}`;

    await new Promise((resolve) => (img.onload = resolve));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const picaInstance = pica();
    await picaInstance.resize(img, canvas);

    return canvas.toDataURL('image/jpeg', 0.8); // Devuelve una imagen comprimida
  }

  async handleTagCreation() {
    const tagValue = (this.form.get('tagInputValue')?.value || '').trim();

    if (tagValue) {
      this.createTag();
    } else {
      await this.tagInputRef.setFocus(); // Esto abre el teclado
      setTimeout(() => {
        this.keyboardVisible = true;
      }, 600);
    }
  }

  onEnterPress(event: KeyboardEvent) {
    // Verificar si la tecla presionada es Enter
    if (event.key === 'Enter') {
      console.log('Se pulsó Enter');
      //Keyboard.hide();  // Cierra el teclado en dispositivos móviles
      console.log('///');
      this.createTag();
    }
  }

  setKeyboardVisibleManually() {
    //this.utilities.showToast("dddd");
    //console.log("FOCO RECIBIDO");
    this.keyboardVisible = true;
  }

  handleGlobalClick(event: Event) {
    const target = event.target as HTMLElement;

    // Verifica si el clic fue fuera de un input o textarea
    const clickedInsideInput = target.closest(
      'ion-input, ion-textarea, input, textarea',
    );

    const clickedExcludedIcon = target.closest('#iconAddTags');

    if (!clickedInsideInput && !clickedExcludedIcon) {
      this.keyboardVisible = false;
      // Opcional: ocultar el teclado (solo si estás seguro que quieres cerrarlo manualmente)
      // await Keyboard.hide();
    }
  }
}
//translateUserLabels
