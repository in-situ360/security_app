import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { SelectModalPage } from '../select-modal/select-modal.page';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-social-networks',
  templateUrl: './social-networks.page.html',
  styleUrls: ['./social-networks.page.scss'],
})
export class SocialNetworksPage implements OnInit {

  @ViewChild('inputRef', { read: ElementRef, static: false }) inputRef: ElementRef;

  public language_code:string='en';
  isAndroid: boolean = false;
  isIOS: boolean = false;
  public form: FormGroup;
  public userSocials: any = [];
  displayNetworks: { id: number, type_network: number, value: string,isAdditionalInputVisible: boolean, additionalValue: string,errorMessage?: string}[] = [];
  selectedIndex: number | null = null;

  private interval: any = null;
  private countSeg: number;
  private previousDate: Date | null = null;
  private isActive2: boolean = true;
  private routerSubscription: Subscription;
  public textLink:any='';
  public placeholderName:string='';
  isChargeLoading:boolean=false;

  constructor(
    private translate: TranslateService,
    private platform: Platform,
    private modalCtrl: ModalController,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private navCtrl: NavController,
    private router: Router,
    
  ) {
    this.isIOS = this.platform.is('ios');
    this.isAndroid = this.platform.is('android');
    
  }

  ngOnInit() {
    this.form = new FormGroup({
      userSocials: new FormControl([]),
    });
    

    this.obtainUserNetworks();
  }



  ionViewDidEnter() {
    console.log(this.translate.langs.length);
  
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

  goBack(){
    this.navCtrl.pop()
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.placeholderName = this.translate.instant('social-networks.Nombre');
    this.textLink=this.translate.instant('Añade un link');
  }

  public obtainUserNetworks() {
    this.apiService.obtainUserNetworks({}).subscribe((result) => {
      console.log('DATOS', result);
      this.userSocials = result['userSocials'];

      console.log(this.userSocials);

      // Mapear userSocials a displayNetworks
      // Primero, mapeamos las redes sociales recibidas
      this.displayNetworks = this.userSocials.map((social, index) => ({
        id: index,
        type_network: social.type_network || 0,
        value: social.value || '',
        isAdditionalInputVisible: false, // Inicialmente invisible
        additionalValue: social.name || '' // Inicializamos el valor del input adicional vacío
      }));

      // Ahora aseguramos que haya siempre 5 redes, rellenando con objetos vacíos si es necesario
      while (this.displayNetworks.length < 5) {
        this.displayNetworks.push({ id: this.displayNetworks.length, type_network: 0, value: '', isAdditionalInputVisible: false, additionalValue: '' });
      }

      // Actualizamos el formulario con los datos completos
      this.form.get('userSocials').patchValue(this.displayNetworks);
    }, error => {
      
      console.log(error);
    });
  }

  getIconPath(typeNetwork: number): string {
    switch (typeNetwork) {
      case 1: // Instagram
        //return 'assets/icon/instagram.svg';
        return 'assets/imgs/LogosRedes/Instagram_logo_2022.svg.png';
      case 2: // Twitter
       // return 'assets/icon/twitter.svg';
        return 'assets/imgs/LogosRedes/images.png';
      case 3: // Facebook
       // return 'assets/icons/facebook_logo.svg';
        return 'assets/imgs/LogosRedes/Facebook_Logo_(2019).png';
      case 4: //youtube
        //return 'assets/icons/youTube_circular.svg';
        return 'assets/imgs/LogosRedes/Youtube_logo.png';
      case 5: //vimeo
        //return 'assets/icons/vimeo.svg';
        return 'assets/imgs/LogosRedes/vimeo-logo-vimeo-logo-transparent-vimeo-icon-transparent-free-free-png.webp';
      case 6: //
       // return 'assets/icons/soundcloud.svg';
        return 'assets/imgs/LogosRedes/soundcloud-logo-soundcloud-icon-transparent-png-1.png';
      case 7: //
       // return 'assets/icons/linkedin.svg';
        return 'assets/imgs/LogosRedes/LinkedIn_logo_initials.png';
      case 8: //
        //return 'assets/icons/pinterest.svg';
        return 'assets/imgs/LogosRedes/pinterest-logo-pinterest-transparent-free-png.png';
      case 9: //
       // return 'assets/icons/tiktok.svg';
        return 'assets/imgs/LogosRedes/tiktok-logo-tikok-icon-transparent-tikok-app-logo-free-png.webp';
      case 11: //
       // return 'assets/icons/behance.svg';
        return 'assets/imgs/LogosRedes/free-behance-icon-2161-thumb.png';
      case 12: //
        //return 'assets/icons/spotify.svg';
        return 'assets/imgs/LogosRedes/1024px-Spotify.png';
      case 13: //
        //return 'assets/icons/dribbble.svg';
        return 'assets/imgs/LogosRedes/dribbble-icon-1-logo-png-transparent.png';
      case 14: //
        return 'assets/icons/link-tabsPink.svg';
        return '';
      default:
        return 'assets/icons/add-tag-1.svg'; // No icon for empty fields
    }
  }

  submitFormAnterior() {

    // Verifica que cada red social con link tenga un tipo seleccionado
    for (let i = 0; i < this.displayNetworks.length; i++) {
      const network = this.displayNetworks[i];
      
      if (network.value && network.type_network === 0) {
        this.utilities.showToast(this.translate.instant('social-networks.Por favor selecciona un icono para cada red social con un link.'));
        return; // Detiene el guardado
      }
    }


    this.form.get('userSocials').patchValue(this.displayNetworks);
    this.apiService.updateNetworks(this.form.value).subscribe(
      (result: any) => {
        this.apiService.userChanges2.next();
        this.navCtrl.navigateForward('/tabs/my-profile');
       // this.utilities.showToast('Usuario actualizado correctamente');
      },
      error => {
        console.log(error);
      }
    );
  }





  submitForm() {
  let hasError = false;

  // Validar cada red
  this.displayNetworks.forEach((network, index) => {
    /*if (!network.value || network.value.trim() === '') {
      network.errorMessage = this.translate.instant('social-networks.Por favor introduce un enlace.');
      hasError = true;
    }
    else if (!network.additionalValue || network.additionalValue.trim() === '') {
      network.errorMessage = this.translate.instant('social-networks.Por favor introduce un nombre.');
      hasError = true;
      
    }
    else if (network.value && network.type_network === 0) {
      network.errorMessage = this.translate.instant('social-networks.Por favor selecciona un icono para esta red social.');
      hasError = true;
    } else {
      network.errorMessage = ''; // Limpiar errores anteriores
    }*/


     /* let errors: string[] = [];

   

    // 2️⃣ Falta nombre
    if (!network.additionalValue || network.additionalValue.trim() === '') {
      errors.push(this.translate.instant('social-networks.Por favor introduce un nombre.'));
      hasError = true;
    }

    // 3️⃣ Falta icono
    if (network.value && network.type_network === 0) {
      errors.push(this.translate.instant('social-networks.Por favor selecciona un icono para esta red social.'));
      hasError = true;
    }


     // 1️⃣ Falta enlace
    if (!network.value || network.value.trim() === '') {
      errors.push(this.translate.instant('social-networks.Por favor introduce un enlace.'));
      hasError = true;
    }

    // Guarda todos los errores juntos separados por salto de línea
    network.errorMessage = errors.join('\n');
*/


  let errors: string[] = [];

  const link = (network.value || '').trim();
  const name = (network.additionalValue || '').trim();
  const icon = network.type_network;
  const touched = !!(link || name || icon !== 0); // fila “tocada”

  if (touched) {


    if (!link && !name) {
      network.errorMessage = '';
      return;
    }

    // 2️⃣ Falta nombre
    if (!name) {
      errors.push(this.translate.instant('social-networks.Por favor introduce un nombre.'));
      hasError = true;
    }

    // 3️⃣ Falta icono (validar aunque el link esté vacío si la fila está tocada)
    if (icon === 0) {
      errors.push(this.translate.instant('social-networks.Por favor selecciona un icono para esta red social.'));
      hasError = true;
    }

    // 1️⃣ Falta enlace
    if (!link) {
      errors.push(this.translate.instant('Por favor introduce un enlace.'));
      hasError = true;
    }
  }

  // Guarda todos los errores juntos separados por salto de línea
  network.errorMessage = errors.join('\n');


  });

  if (hasError) {
    return; // No se envía si hay errores
  }


  this.isChargeLoading=true;
  // Todo bien, enviar
  this.form.get('userSocials').patchValue(this.displayNetworks);
  this.apiService.updateNetworks(this.form.value).subscribe(
    (result: any) => {
      this.isChargeLoading=false;
      this.apiService.userChanges2.next();
      this.navCtrl.navigateForward('/tabs/my-profile');
    },
    error => {
      this.isChargeLoading=false;
      console.log(error);
    }
  );
}


  changeNetworkType(index: number, event: Event) {
    event.stopPropagation();
    console.log("Changing network type");
    this.selectedIndex = index;
    this.abrirModalInvitado(index);
  }

  async abrirModalInvitado(index: number) {
    const modal = await this.modalCtrl.create({
      component: SelectModalPage,
      cssClass: 'SelectModal',
      componentProps: {
        /* You can pass other props if needed */
      },
    });

    modal.onDidDismiss().then((data) => {
      const selectedNetwork = Number(data.data?.selectedNetwork);
      console.log('Red social devuelta:', selectedNetwork);

      if (selectedNetwork != 0) {
        // Aquí puedes manejar el valor devuelto según sea necesario
        if (this.displayNetworks[index].value) {
          this.displayNetworks[index].type_network = selectedNetwork;
        } else {
          this.displayNetworks[index] = {
            id: index,
            type_network: selectedNetwork,
            value: '', 
            isAdditionalInputVisible: false,  // Inicializar la visibilidad del input adicional
            additionalValue: ''              // Inicializar el valor adicional
          };
    
        }
      }
    });

    return await modal.present();
  }

  /*toggleAdditionalInput(index: number) {
    // Mostramos u ocultamos el input adicional cuando el usuario hace click en el ion-input
    this.displayNetworks[index].isAdditionalInputVisible = !this.displayNetworks[index].isAdditionalInputVisible;
  }*/


  toggleAdditionalInput(index: number) {
    // Ocultamos todos los inputs adicionales
    this.displayNetworks.forEach((network, i) => {
      if (i !== index) {
        network.isAdditionalInputVisible = false; // Ocultamos los demás
      }
    });
  
    // Ahora mostramos el input adicional solo para el índice seleccionado
    this.displayNetworks[index].isAdditionalInputVisible = !this.displayNetworks[index].isAdditionalInputVisible;
  }

  updateNetworkValue(index: number, event: any) {
    // Actualizamos solo el valor del input correspondiente en el array displayNetworks
    this.displayNetworks[index].value = event.target.value;
    console.log('Updated network value:', this.displayNetworks[index].value);
  }

  updateAdditionalInput(index: number, event: any) {
    // Actualizamos el valor del input adicional
    this.displayNetworks[index].additionalValue = event.target.value;
    console.log('Updated additional input value:', this.displayNetworks[index].additionalValue);
  }

  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2 = state.isActive;
      if (this.isActive2) {
        const currentRoute = this.router.url;
        if (currentRoute.includes('/social-networks')) {
          console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
          // this.startInterval();
        }
      }
      else {
        // this.clearInterval();
      }
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (!event.url.includes('/social-networks')) {
         // console.log('Saliendo de social-networks, limpiando intervalos');
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
    console.log("Se ejecuta ionViewWillLeave");
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
      console.log("INTERVAL NULL CREANDO UNO NUEVO-----------------------------------");
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
      console.log("Suscripción al router cancelada correctamente");
    }

    if (this.interval) {
      this.apiService.registerTimeScreen({ screenId: 20, screenTime: this.countSeg }).subscribe((result) => {
        console.log('DATOS', result);
      }, error => {
        console.log(error);
      });

      clearInterval(this.interval);
      this.interval = null;
    }
  }

  // Calcula la diferencia entre la fecha anterior y la actual
  private checkDateDifference() {
    const currentDate = new Date();

    if (!this.isActive2) {
      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg = this.countSeg + differenceInSeconds;
      console.log(`social-networks: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      this.apiService.registerTimeScreen({ screenId: 20, screenTime: this.countSeg }).subscribe((result) => {
        console.log('DATOS', result);
      }, error => {
        console.log(error);
      });

      // this.clearInterval();
      return;
    }

    if (this.isActive2) {
      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg = this.countSeg + differenceInSeconds;
      console.log(`social-networks: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);
    }

    this.previousDate = currentDate;
  }


}
