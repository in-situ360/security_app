import { Component, OnInit } from '@angular/core';

import { FormControl, FormGroup } from '@angular/forms'; // Importa NgModel
import {
  AlertController,
  ModalController,
  NavController,
  Platform,
} from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

import { TranslateService } from '@ngx-translate/core'; //MULTI LENGUAJE

import { NavigationEnd, Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Subscription } from 'rxjs';

import { Globalization } from '@awesome-cordova-plugins/globalization/ngx';

@Component({
  selector: 'app-my-suscription',
  templateUrl: './my-suscription.page.html',
  styleUrls: ['./my-suscription.page.scss'],
})
export class MySuscriptionPage implements OnInit {
  isAndroid: boolean = false;
  isIOS: boolean = false;

  selectedSuscriptionId: number | null = null;

  selectedValue: string = 'mensual'; // Valor inicial

  selected: string = '';
  checked: string = '';

  public suscripcionesAnuales: any = [];
  public suscripcionesMensuales: any = [];
  public actualSuscription: any = null;
  public suscriptions: any = [];

  public suscriptionSelected: any = null;

  public buttonText: string = '';

  private readonly subscriptionUrl = 'https://in-situ360.com/es/subscription';

  public modalDescript: any = '';
  isModalOpen = false;

  //SEGUIMIENTO DE TIEMPO
  private interval: any = null;
  private countSeg: number;
  private previousDate: Date | null = null;
  private isActive2: boolean = true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  // Mapeo de regiones a monedas (ISO 4217)

  public country = 'ES';
  public country2 = 'ES';

  public form: FormGroup;

  public fromPopPup: boolean = false;

  constructor(
    private globalization: Globalization,
    private modalCtrl: ModalController,
    private platform: Platform,
    private navCtrl: NavController,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private alertController: AlertController,
    private router: Router,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    /*
    this.globalization.getPreferredLanguage()
    .then(res => console.log('Idioma del sistema:', res.value))
    .catch(e => console.log('Error obteniendo idioma:', e));

  this.globalization.getLocaleName()
    .then(res => console.log('>>>>Región del sistema:', res.value))
    .catch(e => console.log('Error obteniendo región:', e));
  


  this.globalization.getLocaleName()
  .then(res => {
    const region = res.value.split('@rg=')[1]?.substring(0, 2).toUpperCase() || 'Desconocida';
    console.log('>>>>Región del sistema:', region);
  })
  .catch(e => console.log('Error obteniendo región:', e));


  //-------------------------------------------------------
  this.globalization.getLocaleName()
  .then(res => {
    let locale = res.value;
    let region = locale.includes('@rg=') 
      ? locale.split('@rg=')[1]?.substring(0, 2).toUpperCase() 
      : locale.split('-')[1]?.substring(0, 2).toUpperCase();
    
    console.log('LEGENDARIO>>>> Región del sistema:', region);
    this.country=region;
  })
  .catch(e => console.log('Error obteniendo región:', e));
*/

    this.fromPopPup = history.state?.fromPopPup ?? false;
  }

  ionViewWillEnter() {
    this.isIOS = this.platform.is('ios');
    this.isAndroid = this.platform.is('android');

    console.log('SE EJECUTA ionViewWillEnter');

    App.addListener('appStateChange', (state) => {
      console.log('se lanza evento ACTIVO/INACTIVO');
      const currentRoute = this.router.url;
      console.log('Ruta actual:', currentRoute);
      this.isActive2 = state.isActive;
      if (this.isActive2) {
        if (currentRoute.includes('/my-suscription')) {
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
        if (!event.url.includes('/my-suscription')) {
          //   console.log('Saliendo de my-suscription, limpiando intervalos');
          // this.clearInterval();
        } else {
          // this.startInterval();
        }
      }
    });

    if (this.interval == null) {
      // this.startInterval();
    }

    //----------------------------------

    this.form = new FormGroup({
      reg: new FormControl('EN'),
    });

    this.getDataToChangeSuscriptions();

    //----------------------------------

    this.globalization
      .getLocaleName()
      .then((res) => {
        let locale = res.value;
        let region = locale.includes('@rg=')
          ? locale.split('@rg=')[1]?.substring(0, 2).toUpperCase()
          : locale.split('-')[1]?.substring(0, 2).toUpperCase();

        console.log('LEGENDARIO>>>> Región del sistema:', region);
        this.country = region;
        //this.utilities.showToast(this.country);
        this.form = new FormGroup({
          reg: new FormControl(this.country),
        });

        this.getDataToChangeSuscriptions();
      })
      .catch((e) => console.log('Error obteniendo región:', e));
  }

  getDataToChangeSuscriptions() {
    this.apiService.getDataToChangeSuscriptions(this.form.value).subscribe(
      (result) => {
        console.log(result);
        console.log(result.suscripcionesMensuales);
        this.suscripcionesAnuales = result.suscripcionesAnuales;
        //this.suscripcionesMensuales=result.suscripcionesMensuales;
        this.suscripcionesMensuales = result.suscripcionesMensuales.filter(
          (suscripcion) => !suscripcion.hide,
        );

        this.actualSuscription = result.suscripcionActual;

        if (this.selectedValue == 'mensual') {
          this.suscriptions = this.suscripcionesMensuales;
        } else {
          this.suscriptions = this.suscripcionesAnuales;
        }
      },
      (error) => {
        this.utilities.showToast(
          this.translate.instant(
            'my-suscription.No se obtuvieron suscripciones',
          ),
        );
        console.log(error);
      },
    );
  }

  onRadioChange(event: any) {
    this.selectedValue = event.detail.value; // Captura el valor seleccionado
    console.log('Opción seleccionada:', this.selectedValue);
    if (this.selectedValue == 'mensual') {
      this.suscriptions = this.suscripcionesMensuales;
    } else {
      this.suscriptions = this.suscripcionesAnuales;
    }
  }

  selectSuscription0(sub: any): void {
    this.suscriptionSelected = sub;
    this.selectedSuscriptionId = sub.id;

    if (this.actualSuscription == null) {
      this.buttonText = this.translate.instant('my-suscription.Obtener plan ');
    } else {
      this.buttonText = this.translate.instant(
        'my-suscription.Cambiar a plan ',
      );
    }

    this.buttonText = this.buttonText =
      this.translate.instant('my-suscription.Cambiar a plan ') +
      this.suscriptionSelected.name;
  }

  selectSuscription1(sub: any): void {
    // Verificamos si la suscripción seleccionada es la misma que la actual
    const isSameSub =
      this.actualSuscription &&
      sub.id === this.actualSuscription.id &&
      (!sub.countrySub ||
        !this.actualSuscription.countrySub || // si no hay countrySub, comparamos solo el ID
        sub.countrySub.id === this.actualSuscription.countrySub.id); // si hay countrySub, comparamos también el país

    if (isSameSub) {
      // No hacemos nada si es la misma
      return;
    }

    // Guardamos la selección
    this.suscriptionSelected = sub;
    this.selectedSuscriptionId = sub.id;

    // Determinamos el texto del botón
    if (this.actualSuscription == null) {
      this.buttonText = this.translate.instant('my-suscription.Obtener plan ');
    } else {
      this.buttonText = this.translate.instant(
        'my-suscription.Cambiar a plan ',
      );
    }

    this.buttonText += this.suscriptionSelected.name;
  }

  selectSuscriptionBlack(sub: any): boolean {
    const current = this.actualSuscription;

    const currentHasCountry = !!current.countrySub;
    const subHasCountry = !!sub.countrySub;

    const isSameSub =
      currentHasCountry && subHasCountry
        ? current.countrySub.id === sub.countrySub.id
        : !currentHasCountry && !subHasCountry && current.id === sub.id;

    if (isSameSub) {
      // Es la misma sub actual => no hacemos nada
      return true;
    }

    return false;
  }

  selectSuscription(sub: any): void {
    if (!this.actualSuscription) {
      // No hay sub actual, así que seleccionamos directamente
      this.suscriptionSelected = sub;
      this.selectedSuscriptionId = sub.id;
      this.buttonText =
        this.translate.instant('my-suscription.Obtener plan ') + sub.name;
      return;
    }

    const current = this.actualSuscription;

    const currentHasCountry = !!current.countrySub;
    const subHasCountry = !!sub.countrySub;

    const isSameSub =
      currentHasCountry && subHasCountry
        ? current.countrySub.id === sub.countrySub.id
        : !currentHasCountry && !subHasCountry && current.id === sub.id;

    if (isSameSub) {
      // Es la misma sub actual => no hacemos nada
      return;
    }

    // Es una suscripción diferente => seleccionamos
    this.suscriptionSelected = sub;
    this.selectedSuscriptionId = sub.id;

    this.buttonText =
      this.translate.instant('my-suscription.Cambiar a plan ') + sub.name;
  }

  goBack() {
    //si se llego aqui al principio mediante el modal de necesitar una suscripcion debe redireccionar al perfil de usuario automaticamente
    if (this.fromPopPup) {
      this.navCtrl.navigateRoot('/tabs/my-profile');
    } else {
      this.navCtrl.pop();
    }
    //this.navCtrl.pop()
  }

  goToSuscriptionCheckout(): void {
    const openedWindow = window.open(
      this.subscriptionUrl,
      '_blank',
      'noopener,noreferrer',
    );

    if (!openedWindow) {
      window.location.href = this.subscriptionUrl;
    }
  }

  /*
  goToSuscriptionCheckout() {
    if (this.suscriptionSelected.price <= 0) {
      this.cambioGratis();
    } else {
      let argReg = this.country;

      if (this.suscriptionSelected?.countrySub == null) {
        argReg = 'ES';
      }

      this.navCtrl.navigateForward('/suscription-checkout', {
        state: { suscriptionSelected: this.suscriptionSelected, reg: argReg },
      });
    }
  }*/

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

    // App.removeAllListeners(); // Elimina todos los listeners de App

    if (this.interval) {
      //ENVIO TIEMPO
      this.apiService
        .registerTimeScreen({ screenId: 44, screenTime: this.countSeg })
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
      //console.log(`my-suscription: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      //console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService
        .registerTimeScreen({ screenId: 44, screenTime: this.countSeg })
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
      // console.log(`my-suscription: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      //console.log(this.countSeg);
    } else {
      //  console.log('my-suscription: No hay fecha anterior, usando la actual como inicial.');
    }

    this.previousDate = currentDate;
  }

  cambioGratis() {
    this.utilities.showLoading(
      this.translate.instant('my-suscription.Cargando...'),
    );

    this.apiService
      .cambioGratis({ nuevaSub: this.suscriptionSelected.id })
      .subscribe(
        (result) => {
          console.log('Result', result);

          this.utilities.dismissLoading();

          //this.utilities.showToast("Suscripción cambiada");
          //this.modalDescript = `Suscripción cambiada con éxito`;
          this.setOpen(true);
        },
        (error) => {
          this.utilities.dismissLoading();

          this.utilities.showToast(
            this.translate.instant(
              'my-suscription.Hubo un problema para cambiar',
            ),
          );
          console.log(error);
        },
      );
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  activame($modal) {
    console.log('se activo!');
    $modal.dismiss();
    this.isModalOpen = false;
    //this.goBack();
    //this.navCtrl.navigateRoot('tabs/profile');

    this.apiService.getDataToChangeSuscriptions(this.form.value).subscribe(
      (result) => {
        console.log(result);
        this.suscripcionesAnuales = result.suscripcionesAnuales;
        this.suscripcionesMensuales = result.suscripcionesMensuales;
        this.actualSuscription = result.suscripcionActual;

        if (this.selectedValue == 'mensual') {
          this.suscriptions = this.suscripcionesMensuales;
        } else {
          this.suscriptions = this.suscripcionesAnuales;
        }
      },
      (error) => {
        this.utilities.showToast(
          this.translate.instant(
            'my-suscription.No se obtuvieron suscripciones',
          ),
        );

        console.log(error);
      },
    );
  }

  currencySymbol(countryCode: string | null): string {
    return this.currencyMap[countryCode] || '€'; // Si no encuentra, usa €
  }

  private currencyMap: { [key: string]: string } = {
    AF: '؋',
    AL: 'L',
    DZ: 'دج',
    AS: '$',
    AD: '€',
    AO: 'Kz',
    AI: '$',
    AG: '$',
    AR: '$',
    AM: '֏',
    AW: 'ƒ',
    AU: '$',
    AT: '€',
    AZ: '₼',
    BS: '$',
    BH: 'د.ب',
    BD: '৳',
    BB: '$',
    BY: 'Br',
    BE: '€',
    BZ: '$',
    BJ: 'CFA',
    BM: '$',
    BT: 'Nu.',
    BO: 'Bs.',
    BA: 'KM',
    BW: 'P',
    BR: 'R$',
    BN: '$',
    BG: 'лв',
    BF: 'CFA',
    BI: 'FBu',
    KH: '៛',
    CM: 'CFA',
    CA: '$',
    CV: 'CVE',
    KY: '$',
    CF: 'CFA',
    TD: 'CFA',
    CL: '$',
    CN: '¥',
    CO: '$',
    KM: 'CF',
    CG: 'CFA',
    CR: '₡',
    HR: 'kn',
    CU: '$',
    CY: '€',
    CZ: 'Kč',
    DK: 'kr',
    DJ: 'Fdj',
    DM: '$',
    DO: 'RD$',
    EC: '$',
    EG: '£',
    SV: '$',
    GQ: 'CFA',
    ER: 'Nfk',
    EE: '€',
    ET: 'Br',
    FJ: '$',
    FI: '€',
    FR: '€',
    GA: 'CFA',
    GM: 'D',
    GE: '₾',
    DE: '€',
    GH: 'GH₵',
    GR: '€',
    GD: '$',
    GT: 'Q',
    GN: 'GNF',
    GY: '$',
    HT: 'G',
    HN: 'L',
    HK: '$',
    HU: 'Ft',
    IS: 'kr',
    IN: '₹',
    ID: 'Rp',
    IR: '﷼',
    IQ: 'ع.د',
    IE: '€',
    IL: '₪',
    IT: '€',
    CI: 'CFA',
    JM: '$',
    JP: '¥',
    JO: 'د.ا',
    KZ: '₸',
    KE: 'KSh',
    KW: 'د.ك',
    KG: 'с',
    LA: '₭',
    LV: '€',
    LB: 'ل.ل',
    LS: 'L',
    LR: '$',
    LY: 'ل.د',
    LI: 'CHF',
    LT: '€',
    LU: '€',
    MO: 'P',
    MG: 'Ar',
    MW: 'MK',
    MY: 'RM',
    MV: 'Rf',
    ML: 'CFA',
    MT: '€',
    MH: '$',
    MR: 'أ.م',
    MU: '₨',
    MX: '$',
    FM: '$',
    MD: 'L',
    MC: '€',
    MN: '₮',
    ME: '€',
    MA: 'د.م.',
    MZ: 'MT',
    MM: 'K',
    NA: '$',
    NP: '₨',
    NL: '€',
    NZ: '$',
    NI: 'C$',
    NE: 'CFA',
    NG: '₦',
    KP: '₩',
    MK: 'ден',
    NO: 'kr',
    OM: 'ر.ع.',
    PK: '₨',
    PW: '$',
    PA: 'B/.',
    PG: 'K',
    PY: '₲',
    PE: 'S/',
    PH: '₱',
    PL: 'zł',
    PT: '€',
    QA: 'ر.ق',
    RO: 'lei',
    RU: '₽',
    RW: 'R₣',
    WS: 'T',
    SA: 'ر.س',
    SN: 'CFA',
    RS: 'дин.',
    SC: '₨',
    SG: '$',
    SK: '€',
    SI: '€',
    SB: '$',
    SO: 'Sh',
    ZA: 'R',
    KR: '₩',
    LK: 'Rs',
    SD: 'ج.س.',
    SR: '$',
    SE: 'kr',
    CH: 'CHF',
    SY: '£',
    TW: 'NT$',
    TJ: 'ЅМ',
    TZ: 'TSh',
    TH: '฿',
    TL: '$',
    TG: 'CFA',
    TO: 'T$',
    TN: 'د.ت',
    TR: '₺',
    TM: 'm',
    UG: 'USh',
    UA: '₴',
    AE: 'د.إ',
    GB: '£',
    US: '$',
    UY: '$U',
    UZ: 'so’m',
    VU: 'VT',
    VE: 'Bs.S',
    VN: '₫',
    YE: '﷼',
    ZM: 'ZK',
    ZW: '$',
  };

  shouldShowActualPlan(): boolean {
    if (!this.actualSuscription) return false;
    return !this.suscriptions.some((s) => this.isActualSuscription(s));
  }

  isCurrentPlan(plan: any): boolean {
    const current = this.actualSuscription;

    if (!current || !plan) return false;

    const currentId = current.countrySub?.id || current.id;
    const planId = plan.countrySub?.id || plan.id;

    return currentId === planId;
  }

  isActualSuscription(suscription: any): boolean {
    const current = this.actualSuscription;

    if (!current || !suscription) return false;

    const currentHasCountry = !!current.countrySub;
    const subHasCountry = !!suscription.countrySub;

    if (currentHasCountry && subHasCountry) {
      return current.countrySub.id === suscription.countrySub.id;
    }

    if (!currentHasCountry && !subHasCountry) {
      return current.id === suscription.id;
    }

    // Si uno tiene countrySub y el otro no, entonces NO son iguales
    return false;
  }
}
