import { Component, OnInit } from '@angular/core';
import { Keyboard } from '@capacitor/keyboard';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { RangePriceModalPage } from '../range-price-modal/range-price-modal.page';
import { InfoModalPage } from '../info-modal/info-modal.page';
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';

import { InfiniteScrollCustomEvent } from '@ionic/angular';

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/User';



declare var google; //GOOGLEPLACE

//--
@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.page.html',
  styleUrls: ['./user-search.page.scss'],
})
export class UserSearchPage implements OnInit {

  mostrarListadoFiltros: boolean = false;

  isAndroid: boolean = false;
  isIOS: boolean = false;
  public access_allow: boolean = false;
  public access_user_allow: boolean = false;
  public filter_allow: boolean = false;
  public searchbar_allow: boolean = false;

  public searchText = '';//para encontrar empresas

  public availableUsers: any = [];
  public untouchedUsers: any = [];
  public usersIds: any = [];
  public userSelected: any = null;
  public mostrarListado = false;

  public isModalOpen1 = false;//nuevo
  public isModalOpen2 = false;


  public canChange: any = true;

  public form: FormGroup;
  public formDetalles: FormGroup;
  public formOrden: FormGroup;//el del modal orden (si se da a buscar se les pasara sus valores a 'form', si no se resetearan)
  public aplicarCambiosModalOrdenar: boolean = false;
  public aplicarCambiosModalDetalles: boolean = false;


  public categorySelected: any = -1;
  public rangePrice: any = 0;
  public rangePriceMinMax: any = { lower: 0, upper: 2001 };
  public isOrdened: boolean = false;

  public typeCategoryIds: any = [];


  public fotografiaCount: any = 0;
  public filmVideoCount: number = 0;
  public tvCount: number = 0;
  public musicaCount: number = 0;
  public eventoFiestaCount: number = 0;
  public teatroCount: number = 0;
  public otrosCount: number = 0;
  public sinCategoriaCount: number = 0;

  public tags: any = [];

  rating: any = 0;

  stars: Array<number> = [0, 1, 2, 3, 4];


  //Id de suscripcion
  idSubscriptionAuthUser: any = null;



  //SEGUIMIENTO DE TIEMPO
  private interval: any = null;;
  private countSeg: number;
  private previousDate: Date | null = null;
  private isActive2: boolean = true;
  private routerSubscription: Subscription;
  //-----------------------------------------
  public formPending: FormGroup;

  // Bandera para controlar continueGettingUsers
  private shouldContinueGettingUsers: boolean = false;

  public totalUsers: number = 0;

  constructor(
    private platform: Platform,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private navCtrl: NavController,
    private translate: TranslateService,
    private modalCtrl: ModalController,
    private router: Router,//SEGUIMIENTO DE TIEMPO
  ) {

    this.isIOS = this.platform.is('ios');
    this.isAndroid = this.platform.is('android');


    this.formPending = new FormGroup({
      pendingUsers: new FormControl([]),

    });



    this.formDetalles = new FormGroup({
      rangePriceValues: new FormControl({ lower: 0, upper: 2001 }),
      locationValue: new FormControl(''),
      isFotografiaSelected: new FormControl(false),
      isFilmVideoSelected: new FormControl(false),
      isTvSelected: new FormControl(false),
      isMusicaSelected: new FormControl(false),
      isEventoSelected: new FormControl(false),
      isTeatroSelected: new FormControl(false),
      isOtrosSelected: new FormControl(false),
      isSinCategoriaSelected: new FormControl(false),
      categoryIds: new FormControl(this.typeCategoryIds),
      tags: new FormControl(this.tags),
      tagInputValue: new FormControl(''),
    });

    this.form = new FormGroup({
      // brand: new FormControl(''),
      mostValued: new FormControl(false),
      bestValued: new FormControl(false),
      expensiveFirst: new FormControl(false),
      cheapFirst: new FormControl(false),
      isOrdened: new FormControl(false),
      name: new FormControl(this.searchText),
      categoryId: new FormControl(this.categorySelected),
      rangePrice: new FormControl(this.rangePrice),
      rangePriceValues: new FormControl({ lower: 0, upper: 2001 }),
      locationValue: new FormControl(''),
      isFotografiaSelected: new FormControl(false),
      isFilmVideoSelected: new FormControl(false),
      isTvSelected: new FormControl(false),
      isMusicaSelected: new FormControl(false),
      isEventoSelected: new FormControl(false),
      isTeatroSelected: new FormControl(false),
      isOtrosSelected: new FormControl(false),
      isSinCategoriaSelected: new FormControl(false),
      categoryIds: new FormControl(this.typeCategoryIds),
      tags: new FormControl(this.tags),
      tagInputValue: new FormControl(''),
      usersIds: new FormControl([]),
      //vehicleIds: new FormControl(this.vehicleIds),

    });


    this.formOrden = new FormGroup({
      mostValued: new FormControl(false),
      bestValued: new FormControl(false),
      expensiveFirst: new FormControl(false),
      cheapFirst: new FormControl(false),

    });








  }





  ngOnInit() {
    this.apiService.userFollow$.subscribe(([userId, followData]) => {
      if (userId !== null) {
        // Aquí actualizas el estado de los usuarios al recibir el cambio
        this.updateUserFollowStatus(userId, followData);
      }
    });
  }

  // Método para actualizar el follow status de un usuario específico
  updateUserFollowStatus(userId: number, followData: any) {
    const user = this.availableUsers.find((u) => u.id === userId);
    if (user) {
      user.hasFollow = followData; // Aquí actualizas el estado en el usuario
    }

    const user2 = this.untouchedUsers.find((u) => u.id === userId);
    if (user2) {
      user2.hasFollow = followData; // Aquí actualizas el estado en el usuario
    }


  }

  ionViewDidEnter() {

    this.checkAndSelectDefault();
    console.log(this.translate.langs.length);

    this.utilities.getLang().then((result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo == null) {
        console.log("No idioma");
        this.utilities.saveLang('en');


      } else {

        this.switchLanguage(prefijo || 'en');
      }
    });
    this.getCategoryCounter();

    this.apiService.getEntity('user').subscribe((user: User) => {
      if (user) {
        this.idSubscriptionAuthUser = user.sub_id;
        console.log('Usuario autenticado en user-search:', this.idSubscriptionAuthUser);
      }
    });
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción

  }

  /*ngAfterViewInit() {
    // Añadir el listener de evento directamente al input interno del ion-searchbar
    const inputElement = this.searchbar.nativeElement.querySelector('input');
    if (inputElement) {
      inputElement.addEventListener('keyup', this.onEnterPress.bind(this));
    }
  }*/






  onSearchChange($event) {
    //console.log($event);

    if (this.searchText != '') {
      this.mostrarListado = true;
      this.form.get('name').patchValue(this.searchText);
      this.getUsers();
      /*this.availableUsers = this.untouchedUsers;
      this.availableUsers = this.availableUsers.filter((x) => {
        return x.public_name.toLowerCase().includes(this.searchText.toLowerCase());
      });*/
    }
    else {
      this.form.get('name').patchValue('');
      this.mostrarListado = false;
    }


  }

  onSearchClear() {
    console.log("Se pulsó la X, limpiando búsqueda.");
    Keyboard.hide();
    this.searchText = ''; // Limpia la variable vinculada
    this.mostrarListado = false; // Actualiza el estado relacionado
    this.form.get('name').patchValue(''); // Limpia el valor del formulario si es necesario
  }






  getUsers() {

    // Detener cualquier proceso de continueGettingUsers en curso
    this.shouldContinueGettingUsers = false;

    this.totalUsers = 0;
    this.form.get('usersIds').patchValue([]);
    this.availableUsers = [];
    this.untouchedUsers = [];

    // Activar la bandera para permitir continueGettingUsers
    this.shouldContinueGettingUsers = true;

    this.apiService.getUsers(this.form.value).subscribe((result) => {
      if (!this.shouldContinueGettingUsers) {
        return;
      }
      console.log('DATOS', result);
      this.availableUsers = result['users'];
      this.untouchedUsers = result['users'];
      this.usersIds = result['usersIds'];
      this.form.get('usersIds').patchValue(this.usersIds);


      this.totalUsers = result['totalUsers'];
      //this.totalUsers=this.totalUsers-(result['users']?.length);

      if (this.totalUsers > this.availableUsers.length && this.shouldContinueGettingUsers) {
        this.continueGettingUsers();
      }

      /*
      
            if(result['pendingUsers'] && result['pendingUsers'].length > 0){
              //pendingUsers>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      
              this.formPending.get('pendingUsers').patchValue(result['pendingUsers']);
      
              this.apiService.getUsersPending(this.formPending.value).subscribe((result) => {
                console.log('DATOS PENDING',result);
            
                const translatedUsers = result['users'];
      
                translatedUsers.forEach((translatedUser) => {
                  const index = this.availableUsers.findIndex(n => n.id === translatedUser.id);
                  if (index !== -1) {
                    this.availableUsers[index] = translatedUser;
                  }
                });
      
      
                translatedUsers.forEach((translatedUser) => {
                  const index = this.untouchedUsers.findIndex(n => n.id === translatedUser.id);
                  if (index !== -1) {
                    this.untouchedUsers[index] = translatedUser;
                  }
                });
              }, error => {
                console.log(error);
              });
              //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      
            }*/

    }, error => {
      this.translate.get('user-search.No se pudo obtener listado de usuarios').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
      console.log(error);
    });

  }


  continueGettingUsers() {

    // Verificar si debe continuar
    if (!this.shouldContinueGettingUsers) {
      return;
    }



    this.apiService.getUsers(this.form.value).subscribe((result) => {
      if (!this.shouldContinueGettingUsers) {
        return;
      }
      console.log('DATOS', result);
      this.availableUsers = this.availableUsers.concat(result['users']);
      this.untouchedUsers = this.untouchedUsers.concat(result['users']);
      this.usersIds = this.usersIds.concat(result['usersIds']);
      this.form.get('usersIds').patchValue(this.usersIds);

      this.totalUsers = result['totalUsers'];
      console.log('Longitud de users:', result['users']?.length);
      //this.totalUsers=this.totalUsers-(result['users']?.length);

      if (this.totalUsers > this.availableUsers.length && this.shouldContinueGettingUsers) {
        this.continueGettingUsers();
      }


    }, error => {
      this.translate.get('buscador2.No se pudo obtener listado de usuarios').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
      console.log(error);
    });


  }


  getMoreUsers() {
    this.apiService.getUsers(this.form.value).subscribe((result) => {
      console.log('DATOS', result);
      this.availableUsers = this.availableUsers.concat(result['users']);
      this.untouchedUsers = this.untouchedUsers.concat(result['users']);
      this.usersIds = this.usersIds.concat(result['usersIds']);
      this.form.get('usersIds').patchValue(this.usersIds);

      this.totalUsers = result['totalUsers'];
      //this.totalUsers=this.totalUsers-(result['users']?.length);

      if (this.totalUsers > this.availableUsers.length && this.shouldContinueGettingUsers) {
        this.continueGettingUsers();
      }
      /*
            if(result['pendingUsers'] && result['pendingUsers'].length > 0){
              //pendingUsers>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      
              this.formPending.get('pendingUsers').patchValue(result['pendingUsers']);
      
              this.apiService.getUsersPending(this.formPending.value).subscribe((result) => {
                console.log('DATOS PENDING',result);
            
                const translatedUsers = result['users'];
      
                translatedUsers.forEach((translatedUser) => {
                  const index = this.availableUsers.findIndex(n => n.id === translatedUser.id);
                  if (index !== -1) {
                    this.availableUsers[index] = translatedUser;
                  }
                });
      
      
                translatedUsers.forEach((translatedUser) => {
                  const index = this.untouchedUsers.findIndex(n => n.id === translatedUser.id);
                  if (index !== -1) {
                    this.untouchedUsers[index] = translatedUser;
                  }
                });
              }, error => {
                console.log(error);
              });
              //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      
            }*/


    }, error => {
      this.translate.get('buscador2.No se pudo obtener listado de usuarios').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
      console.log(error);
    });

  }

  changeOrder() {
    this.isOrdened = !this.isOrdened;
    this.form.get('isOrdened').patchValue(this.isOrdened);
    this.getUsers();
  }


  goNotifications() {

    this.navCtrl.navigateForward("/notifications");
  }


  goChats() {
    this.navCtrl.navigateForward("/tabs/chats");

  }





  abrirModalOrden() {

    if (false/*this.filter_allow==false*/) {
      this.navCtrl.navigateForward('my-suscription');
    }
    else {
      console.log("abrir modal orden");
      this.isModalOpen1 = true;
      this.aplicarCambiosModalOrdenar = false;
    }

  }

  aplicarModalOrden($modalOrden) {
    this.aplicarCambiosModalOrdenar = true;
    $modalOrden.dismiss();
    this.isModalOpen1 = false;
    this.mostrarListadoFiltros = true;
  }


  ocultarListado($modal1) {
    $modal1.dismiss();
    this.isModalOpen1 = false;
    this.searchText = '';
    this.mostrarListado = false;
    this.mostrarListadoFiltros = false;
    this.form.get('name').patchValue(this.searchText);

  }

  ocultarListado0($modal) {
    $modal.dismiss();
    this.isModalOpen2 = false;
    this.searchText = '';
    this.mostrarListado = false;
    this.mostrarListadoFiltros = false;
    this.form.get('name').patchValue(this.searchText);

  }



  abrirModalGrande() {
    console.log("abrir modal grnade");

    if (false/*this.filter_allow==false*/) {
      this.navCtrl.navigateForward('my-suscription');
    }
    else {

      this.isModalOpen2 = true;
      this.aplicarCambiosModalDetalles = false;

      setTimeout(() => {

        this.initAutocomplete();

        //
      }, 1000);

    }



  }

  cerrarModalGrande($modal) {

    this.aplicarCambiosModalDetalles = true;
    $modal.dismiss();
    this.isModalOpen2 = false;
    console.log(this.form.value);
    //this.getUsers();
    this.mostrarListadoFiltros = true;


    if (this.aplicarCambiosModalDetalles) {
      this.form.get('rangePriceValues')?.setValue(this.rangePriceMinMax);
      this.form.get('locationValue')?.setValue(this.formDetalles.get('locationValue').value);
      this.form.get('isFotografiaSelected')?.setValue(this.formDetalles.get('isFotografiaSelected').value);
      this.form.get('isFilmVideoSelected')?.setValue(this.formDetalles.get('isFilmVideoSelected').value);
      this.form.get('isTvSelected')?.setValue(this.formDetalles.get('isTvSelected').value);
      this.form.get('isMusicaSelected')?.setValue(this.formDetalles.get('isMusicaSelected').value);
      this.form.get('isEventoSelected')?.setValue(this.formDetalles.get('isEventoSelected').value);
      this.form.get('isTeatroSelected')?.setValue(this.formDetalles.get('isTeatroSelected').value);
      this.form.get('isOtrosSelected')?.setValue(this.formDetalles.get('isOtrosSelected').value);
      this.form.get('isSinCategoriaSelected')?.setValue(this.formDetalles.get('isSinCategoriaSelected').value);
      this.form.get('categoryIds')?.setValue(this.formDetalles.get('categoryIds').value);
      this.form.get('tags')?.setValue(this.formDetalles.get('tags').value);
      this.form.get('tagInputValue')?.setValue(this.formDetalles.get('tagInputValue').value);

      this.form.get('locationValue')?.setValue(this.formDetalles.get('locationValue').value);

      console.log('DATOS FORMULARIO USER-SEARCH');
      console.log(this.form.value);
      console.log('----------------------------');

      //this.navCtrl.navigateForward("/buscador2", { state: { form: this.form.value } });
      this.navCtrl.navigateForward("/buscador2", { state: { form: this.form.value, searchText: this.searchText, userSelected: this.userSelected, isFromModalUserSearch: true } });
      this.searchText = "";
      console.log(">>>>>>>>>>ddd");
      this.resetForm();
    }



  }






  async abrirModalRangePrecio() {
    const modal = await this.modalCtrl.create({
      component: RangePriceModalPage,
      cssClass: 'RangePriceModal',
      componentProps: {
        rangePrice: this.rangePrice,
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then((data) => {
      //console.log('Rango dismis devuelto:', data);
      // const selectedNetwork = data.data?.selectedNetwork;
      this.rangePrice = Number(data.data.rangePrice);
      console.log('Rango:', this.rangePrice);
      this.form.get('rangePrice').patchValue(this.rangePrice);
      this.getUsers();


    });


    return await modal.present();
  }





  /*seleccionBarato(){
    console.log('selecciono barato');
    this.form.get('expensiveFirst').patchValue(false);//para quitar la seleccion del caro(en el caso de que estuviera seleccionado)

  }*/


  cerrar($modal) {

    //$modal.dismiss();
    console.log('funcion cerrar');
    this.isModalOpen2 = false;
    console.log(this.form.value);

    if (!this.aplicarCambiosModalDetalles) {
      this.formDetalles.get('locationValue')?.setValue(this.form.get('locationValue').value);
      this.formDetalles.get('isFotografiaSelected')?.setValue(this.form.get('isFotografiaSelected').value);
      this.formDetalles.get('isFilmVideoSelected')?.setValue(this.form.get('isFilmVideoSelected').value);
      this.formDetalles.get('isTvSelected')?.setValue(this.form.get('isTvSelected').value);
      this.formDetalles.get('isMusicaSelected')?.setValue(this.form.get('isMusicaSelected').value);
      this.formDetalles.get('isEventoSelected')?.setValue(this.form.get('isEventoSelected').value);
      this.formDetalles.get('isTeatroSelected')?.setValue(this.form.get('isTeatroSelected').value);
      this.formDetalles.get('isOtrosSelected')?.setValue(this.form.get('isOtrosSelected').value);
      this.formDetalles.get('isSinCategoriaSelected')?.setValue(this.form.get('isSinCategoriaSelected').value);
      this.formDetalles.get('categoryIds')?.setValue(this.form.get('categoryIds').value);
      this.formDetalles.get('tags')?.setValue(this.form.get('tags').value);
      this.formDetalles.get('tagInputValue')?.setValue(this.form.get('tagInputValue').value);
      this.rangePriceMinMax = { lower: 0, upper: 2001 };
      this.formDetalles.get('rangePriceValues')?.setValue(this.rangePriceMinMax);
      this.tags = [];

    }
    else {
      this.getUsers();

    }


  }


  cerrar1($modal1) {

    //$modal.dismiss();
    console.log('funcion cerrar1');
    this.isModalOpen1 = false;
    console.log(this.form.value);


    if (this.aplicarCambiosModalOrdenar == true) {
      this.form.get('bestValued')?.setValue(this.formOrden.get('bestValued').value);
      this.form.get('mostValued')?.setValue(this.formOrden.get('mostValued').value);
      this.form.get('cheapFirst')?.setValue(this.formOrden.get('cheapFirst').value);
      this.form.get('expensiveFirst')?.setValue(this.formOrden.get('expensiveFirst').value);
      this.getUsers();

    }
    else {

      this.formOrden.get('bestValued')?.setValue(this.form.get('bestValued').value);
      this.formOrden.get('mostValued')?.setValue(this.form.get('mostValued').value);
      this.formOrden.get('cheapFirst')?.setValue(this.form.get('cheapFirst').value);
      this.formOrden.get('expensiveFirst')?.setValue(this.form.get('expensiveFirst').value);

    }





  }



  /*onIonChange(event: any) {
    this.rangePrice = event.detail.value;
    console.log('Rango seleccionado:', this.rangePrice);
  }*/
  onIonChange(event: any) {
    console.log('Nuevo rango seleccionado (min):', event.detail.value.lower);
    console.log('Nuevo rango seleccionado (max):', event.detail.value.upper);
    console.log('-----------------------------------------');
    // this.form.get('rangePriceValues')?.setValue(event.detail.value); // Actualiza el FormControl
    //rangePriceValues:new FormControl({ lower: 200, upper: 2000 }),
    //this.rangePriceMinMax=event.detail.value;



    if (event.detail.value.lower > event.detail.value.upper) {
      // Ajustar los valores para que el mínimo no sea mayor que el máximo
      //this.form.get('rangePriceValues')?.setValue({ lower: event.detail.value.upper, upper: event.detail.value.upper });
      this.rangePriceMinMax = { lower: event.detail.value.upper, upper: event.detail.value.upper };
    } else {
      // Actualizar normalmente si la condición se cumple
      // this.form.get('rangePriceValues')?.setValue(event.detail.value);
      this.rangePriceMinMax = event.detail.value;

    }

    console.log(this.form.get('rangePriceValues').value);
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

  }







  public submitForm(): void {
    //this.utilities.showLoading('');
    console.log(this.form.value);
    this.getUsers();
  }

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


  getCategoryCounter() {
    this.apiService.getCategoryCounter({}).subscribe((result) => {
      console.log(result);

      this.fotografiaCount = result['fotografiaCount'];
      this.filmVideoCount = result['filmVideoCount'];
      this.tvCount = result['tvCount'];
      this.musicaCount = result['musicaCount'];
      this.eventoFiestaCount = result['eventoFiestaCount'];
      this.teatroCount = result['teatroCount'];
      this.otrosCount = result['otrosCount'];
      this.sinCategoriaCount = result['sinCategoriaCount'];

      if (result['userSub'] != null && result['userSub'] != 1 && result['userSub'] != 4) {
        this.filter_allow = true;
        this.access_user_allow = true;
      }
      else {
        this.filter_allow = false;
        this.access_user_allow = true;
      }


      if (result['userSub'] != null) {
        this.searchbar_allow = true;
      }
      else {
        this.searchbar_allow = false;
      }


      if (result['userSub'] != null && (result['userSub'] == 3 || result['userSub'] == 6)) {
        this.access_allow = true;
      }
      else {
        this.access_allow = false;
      }


    }, error => {

      this.translate.get('user-search.No se pudo obtener el contador de categorías').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
      console.log(error);
    });


  }


  onCategoryChange(categoryId: number, evento: any): void {
    const isSelected = evento.detail.checked;
    if (isSelected) {
      // Añadir ID al array si no está ya presente
      if (!this.typeCategoryIds.includes(categoryId)) {
        this.typeCategoryIds.push(categoryId);
      }
    } else {
      // Eliminar ID del array si está presente
      this.typeCategoryIds = this.typeCategoryIds.filter(id => id !== categoryId);
    }

    // Actualizar el control del formulario con el array actualizado
    this.formDetalles.get('categoryIds').setValue(this.typeCategoryIds);
    console.log(this.formDetalles.value);
  }



  public updateCategorySelection(categoryId: number): void {
    switch (categoryId) {
      case 1:
        this.form.get('isFotografiaSelected')?.setValue(true);
        break;
      case 2:
        this.form.get('isFilmVideoSelected')?.setValue(true);
        break;
      case 3:
        this.form.get('isTvSelected')?.setValue(true);
        break;
      case 4:
        this.form.get('isMusicaSelected')?.setValue(true);
        break;
      case 5:
        this.form.get('isEventoSelected')?.setValue(true);
        break;
      case 6:
        this.form.get('isTeatroSelected')?.setValue(true);
        break;
      case 7:
        this.form.get('isOtrosSelected')?.setValue(true);
        break;
      case 8:
        this.form.get('isSinCategoriaSelected')?.setValue(true);
        break;
      default:
        console.warn('Invalid categoryId:', categoryId);
        return;
    }
  }


  resetForm() {

    this.rangePrice = -1;
    this.typeCategoryIds = [];
    this.categorySelected = -1;

    this.tags = [];
    this.form.get('tags')?.patchValue(this.tags);

    if (history.state.category) {
      this.categorySelected = history.state.category;
      //añado el valor al arrayde ids de categorias
      this.typeCategoryIds.push(this.categorySelected);
      this.updateCategorySelection(history.state.category);


    }

    console.log(this.typeCategoryIds);

    this.formDetalles.get('locationValue')?.setValue('');
    this.formDetalles.get('isFotografiaSelected')?.setValue(false);
    this.formDetalles.get('isFilmVideoSelected')?.setValue(false);
    this.formDetalles.get('isTvSelected')?.setValue(false);
    this.formDetalles.get('isMusicaSelected')?.setValue(false);
    this.formDetalles.get('isEventoSelected')?.setValue(false);
    this.formDetalles.get('isTeatroSelected')?.setValue(false);
    this.formDetalles.get('isOtrosSelected')?.setValue(false);
    this.formDetalles.get('isSinCategoriaSelected')?.setValue(false);
    this.formDetalles.get('categoryIds')?.setValue(this.typeCategoryIds);
    this.formDetalles.get('tags')?.setValue(this.tags);
    this.formDetalles.get('tagInputValue')?.setValue('');
    this.formDetalles.get('rangePriceValues')?.setValue(this.rangePriceMinMax);


    this.form.get('locationValue')?.setValue('');
    this.form.get('isFotografiaSelected')?.setValue(false);
    this.form.get('isFilmVideoSelected')?.setValue(false);
    this.form.get('isTvSelected')?.setValue(false);
    this.form.get('isMusicaSelected')?.setValue(false);
    this.form.get('isEventoSelected')?.setValue(false);
    this.form.get('isTeatroSelected')?.setValue(false);
    this.form.get('isOtrosSelected')?.setValue(false);
    this.form.get('isSinCategoriaSelected')?.setValue(false);
    this.form.get('categoryIds')?.setValue(this.typeCategoryIds);
    this.form.get('tags')?.setValue(this.tags);
    this.form.get('tagInputValue')?.setValue('');
    this.form.get('rangePriceValues')?.setValue(this.rangePriceMinMax);


    this.form.get('rangePriceValues')?.setValue({ lower: 0, upper: 2001 });
    this.rangePriceMinMax = { lower: 0, upper: 2001 };

    this.formOrden.get('bestValued').patchValue(true);
    this.formOrden.get('mostValued').patchValue(false);
    this.formOrden.get('cheapFirst').patchValue(false);
    this.formOrden.get('expensiveFirst').patchValue(false);

    this.form.get('bestValued').patchValue(true);
    this.form.get('mostValued').patchValue(false);
    this.form.get('cheapFirst').patchValue(false);
    this.form.get('expensiveFirst').patchValue(false);

    this.updateCategorySelection(history.state.category);
    //this.getUsers();

  }



  resetOrderForm() {



    this.formOrden.get('bestValued')?.setValue(false);
    this.formOrden.get('mostValued')?.setValue(false);
    this.formOrden.get('cheapFirst')?.setValue(false);
    this.formOrden.get('expensiveFirst')?.setValue(false);

    this.form.get('bestValued')?.setValue(false);
    this.form.get('mostValued')?.setValue(false);
    this.form.get('cheapFirst')?.setValue(false);
    this.form.get('expensiveFirst')?.setValue(false);
    this.getUsers();
  }




  onCheckboxChange(selected: string) {



    if (this.canChange) {

      this.canChange = false;

      console.log(`Checkbox changed: ${selected}`);



      // Get the form control names
      const controls = ['bestValued', 'mostValued', 'cheapFirst', 'expensiveFirst'];

      // Check the current value of the selected checkbox
      const selectedControl = this.formOrden.get(selected);

      // If the checkbox is being selected (true), deselect all others
      if (selectedControl.value) {
        controls.forEach(control => {
          if (control != selected) {
            this.formOrden.get(control).patchValue(false);  // Deselect other checkboxes
            this.form.get(control).patchValue(false);
          }
          else {
            this.form.get(control).patchValue(true);
          }
        });
      }





      console.log(this.formOrden.value);
      console.log('>>>>>');

      this.canChange = true;

    }
  }


  onCategorySelectChange(selected: string) {


    // Get the form control names
    const controls = ['isFotografiaSelected', 'isFilmVideoSelected', 'isTvSelected', 'isMusicaSelected', 'isEventoSelected', 'isTeatroSelected', 'isOtrosSelected', 'isSinCategoriaSelected'];

    // Check the current value of the selected checkbox
    const selectedControl = this.form.get(selected);
    this.form['selected']

    selectedControl.setValue(true);


    this.form.get('rangePriceValues')?.setValue(this.rangePriceMinMax);

    console.log('DATOS FORMULARIO USER-SEARCH');
    console.log(this.form.value);
    console.log('----------------------------');

    // this.navCtrl.navigateForward("/buscador", {state: {form: this.form.value,searchText:this.searchText,userSelected:this.userSelected}});

    this.goToBuscador2();
    this.resetForm();




  }








  /*getUserLabels(user): string {
    return user?.allmylabels && user.allmylabels.length > 0
        ? user.allmylabels.map(label => label.value).join(', ')
        : 'Sin tags';
  }*/

  getUserLabels(user): string {
    // Primero verifica si existe translateUserLabels y contiene elementos
    return user?.translateUserLabels && user.translateUserLabels.length > 0
      ? user.translateUserLabels.map(label => label.value).join(', ')
      : user?.allmylabels && user.allmylabels.length > 0
        ? user.allmylabels.map(label => label.value).join(', ')
        : this.translate.instant('user-search.Sin tags'); // Traduce 'Sin tags' si no hay etiquetas
  }

  getAbbreviatedName(user): string {

    if (this.idSubscriptionAuthUser === 1 || this.idSubscriptionAuthUser === 4) {
      if (user?.name && user?.surname1) {
        // Si existe surname1 separado, usar nombre + primera letra del apellido
        return user.name + ' ' + user.surname1.charAt(0) + '.';
      } else if (user?.name) {
        // Si no existe surname1, el nombre puede contener nombre y apellido
        const nameStr = user.name.trim();

        // Detectar si es una empresa (contiene S.A., S.L., S.L.U., etc.)
        const empresaPatterns = /\b(S\.A\.|S\.L\.|S\.L\.U\.|S\.A\.U\.|S\.L\.L\.|C\.B\.|E\.I\.R\.L\.|S\.P\.A\.)\b/i;
        if (empresaPatterns.test(nameStr)) {
          // Si es una empresa, devolver el nombre completo
          return nameStr;
        }

        const nameParts = nameStr.split(' ');
        if (nameParts.length > 1) {
          // Si hay más de una palabra, asumir que la última es el apellido
          const firstName = nameParts.slice(0, -1).join(' ');
          const lastName = nameParts[nameParts.length - 1];
          return firstName + ' ' + lastName.charAt(0) + '.';
        }
        return nameStr;
      }
      return '';
    } else {
      return user?.name;
    }

  }



  selectEmp($usuario) {

    if (!this.access_user_allow) {
      this.abrirModalInvitado();
    }
    else {

      console.log($usuario);
      this.userSelected = $usuario;
      this.mostrarListado = false;
      //this.navCtrl.navigateForward("/buscador2", {state: {/*category:null,*/searchText:this.searchText,userSelected:this.userSelected}});
      this.navCtrl.navigateForward("/other-user", { state: { userId: this.userSelected.id } });
      //this.searchText="";

      //this.resetForm();
    }
  }

  conectUser($usuario) {

    if (!this.access_user_allow) {
      this.abrirModalInvitado();
    }
    else {

      console.log($usuario);
      //this.navCtrl.navigateForward("/tabs/home"/*, {state: {searchText:this.searchText,userSelected:this.userSelected}}*/);
      //controlRequest
      this.apiService.controlRequest({ userId: $usuario.id }).subscribe((result) => {
        console.log('DATOS', result);
        if (result['state'] == "ACCESS") {
          this.navCtrl.navigateForward("/conectar", { state: { user: $usuario } });
          this.resetForm();
        }
        else if (result['state'] == "DONTACCESS") {

          this.translate.get('user-search.Ya hay una solicitud enviada pendiente de aceptar').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText);
          });
        }
        else if (result['state'] == "GOCHAT") {
          console.log('debe ir al chat');
          this.navCtrl.navigateForward('interior-chat', {
            state: {
              id_chat: result['chat'].id,
              nombre_chat: $usuario.name,
              ultimo_mensaje: null,
              avatar: $usuario.avatar,
              telNumber: null,
              userId: $usuario.id
            }
          });
          this.resetForm();

        }
        else {

          this.translate.get('user-search.Resultado desconocido').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText);
          });
        }



      }, error => {

        this.translate.get('user-search.No se pudo comprobar la existencia de la solicitud').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText);
        });
        console.log(error);
      });


      /*chat
      this.navCtrl.navigateForward('interior-chat', { state: { id_chat:this.user.hasChat.id,
        nombre_chat:this.user.name,
        ultimo_mensaje:null,
        avatar:this.user.avatar,
        telNumber: null,
        userId:this.user.id
      } });
      */
    }
  }

  selectCategory($opc) {
    console.log($opc);

    this.navCtrl.navigateForward("/buscador", { state: { category: $opc, searchText: this.searchText, userSelected: this.userSelected } });
    this.resetForm();
  }





  createTag() {

    console.log(this.formDetalles.get('tagInputValue')?.value);

    const tag = (this.formDetalles.get('tagInputValue')?.value).trim();
    const tag2 = (this.formDetalles.get('tagInputValue')?.value.trim()).toLowerCase()
    if (tag) {
      if (!this.tags.map(tag => tag.toLowerCase()).includes(tag2)) {



        this.tags.push(tag);
        this.formDetalles.get('tags').patchValue(this.tags);
        console.log(this.formDetalles.get('tags'));
        this.formDetalles.get('tagInputValue')?.setValue('');
        //this.form.get('tagInputValue')?.reset();
      }
      else {
        console.log('Ya hay un Tag con ese valor.');

        this.translate.get('user-search.Ya hay un Tag con ese valor').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText);
        });
      }

    }
    else {
      console.log();

      this.translate.get('user-search.El campo está vacío, no se puede crear un Tag').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });

    }

  }

  deleteTag(tag: string) {
    this.tags = this.tags.filter(t => t !== tag);
    this.formDetalles.get('tags')?.patchValue(this.tags);
  }




  onIconClick() {
    console.log('Icon clicked:', this.searchText);
    // Lógica para manejar el clic en el ícono
  }

  /*onEnterPress() {
     
     console.log("Se pulso intro");
       Keyboard.hide();  // Esto cierra el teclado en dispositivos móviles
       console.log("///");
   }*/

  /*onEnterPress(event: KeyboardEvent) {
    // Verificar si la tecla presionada es Enter
    if (event.key === 'Enter') {
      console.log("Se pulsó Enter");
      Keyboard.hide();  // Cierra el teclado en dispositivos móviles
      console.log("///");
    }
    
  }*/


  onEnterPress(event: KeyboardEvent) {
    // Verificar si la tecla presionada es Enter
    if (event.key === 'Enter') {
      console.log("Se pulsó Enter");
      Keyboard.hide();  // Cierra el teclado en dispositivos móviles
      console.log("///");

      this.mostrarListado = true;
      this.form.get('name').patchValue(this.searchText);
      this.getUsers();


      if (this.searchText == '') {
        this.mostrarListado = false;
        this.form.get('name').patchValue('');
      }
    }

  }




  goToBuscador2() {

    this.navCtrl.navigateForward("/buscador2", { state: { form: this.form.value, searchText: this.searchText, userSelected: this.userSelected } });
    this.searchText = "";
    this.resetForm();

  }




  getStarColor(index: number, average: any): string {

    if (average === 0 || average === null || average === undefined) {
      // Si no hay valoración, las tres primeras estrellas son activas
      return index < 3 ? 'assets/icons/estrella-valoracion.svg' : 'assets/icons/estrella-gris.svg';
    }

    const fractional = average - index;

    if (fractional >= 1) {
      // Star is fully filled
      //console.log("ENTRA ACTIVA");
      return 'assets/icons/estrella-valoracion.svg'; // Pink star
    } else if (fractional > 0) {
      // Star is partially filled
      return 'assets/icons/estrella-half.svg'; // You'd need an SVG for half stars
    } else {
      // Star is empty
      return 'assets/icons/estrella-gris.svg'; // Gray star
    }
  }

  isActive(index: number, average: any): boolean {
    return index < average;
  }




















  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2 = state.isActive;
      if (this.isActive2) {
        console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
        // this.startInterval();
      }
      else {
        // this.clearInterval();

      }

    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Verifica si la ruta actual no es '/UserSearch'
        if (!event.url.includes('/user-search')) {
          // console.log('Saliendo de UserSearchPage, limpiando intervalos');
          // Detener continueGettingUsers cuando se navega fuera de la página
          this.shouldContinueGettingUsers = false;
          // this.clearInterval();
        }
        else {
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
    // Detener continueGettingUsers cuando se sale de la página
    this.shouldContinueGettingUsers = false;
    // this.clearInterval();
  }


  ngOnDestroy() {
    // Detener continueGettingUsers cuando se destruye el componente
    this.shouldContinueGettingUsers = false;
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
    if (this.interval) {

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({ screenId: 2, screenTime: this.countSeg }).subscribe((result) => {
        console.log('DATOS', result);

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


    if (!this.isActive2) {

      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg = this.countSeg + differenceInSeconds;
      // console.log(`UserSearch: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      // console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({ screenId: 2, screenTime: this.countSeg }).subscribe((result) => {
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
      //console.log(`UserSearch: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      // console.log(this.countSeg);


    }
    else {
      console.log('UserSearch: No hay fecha anterior, usando la actual como inicial.');
    }


    this.previousDate = currentDate;
  }







  checkAndSelectDefault() {
    // Get the form control names
    const controls = ['bestValued', 'mostValued', 'cheapFirst', 'expensiveFirst'];

    // Check if any checkbox is selected
    const isAnySelected = controls.some(control => this.formOrden.get(control).value);

    // If none are selected, select 'bestValued'
    if (!isAnySelected) {
      this.formOrden.get('bestValued').patchValue(true);
      this.form.get('bestValued').patchValue(true);

    }

    console.log(this.formOrden.value);
  }


  onSearchInput(event: any) {
    /* const input = event.target as HTMLInputElement;
     if (input) {
       const cursorPosition = input.selectionStart; // Guardar la posición del cursor
       input.value = this.formatText(input.value); // Formatear texto
       input.setSelectionRange(cursorPosition, cursorPosition); // Restaurar la posición del cursor
     }*/
  }

  private formatText(value: string): string {
    // Convertir texto a mayúsculas después de un espacio
    return value.replace(/(?:^| )\w/g, (match) => match.toUpperCase());
  }





  initAutocomplete() {
    const input = document.getElementById('searchTextField') as HTMLInputElement;
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      console.log('Dirección:', input.value);

      console.log('Coordenadas:', place.geometry.location.lat(), place.geometry.location.lng());

      // this.form.get('lat').patchValue(place.geometry.location.lat()+'');
      //this.form.get('lng').patchValue(place.geometry.location.lng()+'');
      this.formDetalles.get('locationValue')?.setValue(input.value);
      //this.form.get('locationValue').patchValue(input.value); 
      const savedValue = this.form.get('actual').value;
      console.log('Valor guardado:', savedValue);



    });
  }


  onInputLocation(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value.trim();

    // Si el campo está vacío, actualizamos el array con un valor vacío
    if (!value) {
      console.log('Localización actual vacia');
      //this.actual= '';
      // this.form.get('lat').patchValue('');
      //this.form.get('lng').patchValue('');
      this.formDetalles.get('locationValue').patchValue('');

    }
  }



  async abrirModalInvitado() {


    let titleText = this.translate.instant('user-search.Sin Suscripción válida');
    let infoText = this.translate.instant('Para acceder a toda la información del usuario y contactarlo, suscríbete al Plan S o al Plan 360.');

    const modal = await this.modalCtrl.create({
      component: InvitadoModalPage,
      cssClass: 'InvitadoMensajeModal',
      componentProps: {
        title: titleText,
        info: infoText,
        showButton: true

      },
      // backdropDismiss:false
    });
    return await modal.present();
  }



  follow($user) {
    if ($user?.hasFollow != null) {
      console.log("QUITAR");
      this.apiService.followUnfollow({ userId: $user.id, opc: 1 }).subscribe((result) => {
        console.log('DATOS', result);

        $user.hasFollow = null;
        this.apiService.changeHasFollowInUser($user.id, null);
      }, error => {
        this.utilities.showToast('');
        console.log(error);
      });

    }
    else {

      console.log("GUARDAR");
      this.apiService.followUnfollow({ userId: $user.id, opc: 2 }).subscribe((result) => {
        console.log('DATOS', result);

        $user.hasFollow = result;
        this.apiService.changeHasFollowInUser($user.id, result);
      }, error => {
        this.utilities.showToast('');
        console.log(error);
      });

    }



  }


  goFollows() {
    this.navCtrl.navigateForward("users-follow");
  }



  onIonInfiniteJobs(ev) {
    //  console.log('-----------llego al final---------------');
    // this.getMoreUsers();
    //console.log(ev);
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

}

