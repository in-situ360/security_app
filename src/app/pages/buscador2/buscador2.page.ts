import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { Keyboard } from '@capacitor/keyboard';
import { ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { RangePriceModalPage } from '../range-price-modal/range-price-modal.page';
import { InfoModalPage } from '../info-modal/info-modal.page';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/User';

declare var google; //GOOGLEPLACE

@Component({
  selector: 'app-buscador2',
  templateUrl: './buscador2.page.html',
  styleUrls: ['./buscador2.page.scss'],
})
export class Buscador2Page implements OnInit {

  public access_user_allow: boolean = false;
  public searchbar_allow: boolean = false;
  public filter_allow: boolean = false;
  public access_allow: boolean = false;

  isAndroid: boolean = false;
  isIOS: boolean = false;
  mostrarListadoFiltros: boolean = false;


  public availableUsers: any = [];
  public untouchedUsers: any = [];
  public usersIds: any = [];
  public userSelected: any = null;
  public mostrarListado = true;
  public permitirBuscar: any = false;
  public searchText = '';
  public categorySelected: any = -1;
  public rangePrice: any = 0;
  public rangePriceMinMax: any = { lower: 0, upper: 2001 };




  public previousUserSelected: any = null;

  public formOrigen: any;//lo que viene de las otras paginas
  public form: FormGroup;//el que se envia para obtener usuarios
  public formOrden: FormGroup;//el del modal orden (si se da a buscar se les pasara sus valores a 'form', si no se resetearan)
  public formDetalles: FormGroup;//el del modal detalles (si se da a buscar se les pasara sus valores a 'form', si no se resetearan)


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




  //modal ordenar
  public aplicarCambiosModalOrdenar: boolean = false;//para cuando se cierre se decida si es para aplicar cambios o dejar los valores como antes de abrir el modal
  public isModalOrden = false;//nuevo



  //modal detalles
  public aplicarCambiosModalDetalles: boolean = false;
  public isModalDetalles = false;

  rating: any = 0;

  stars: Array<number> = [0, 1, 2, 3, 4];

  //SEGUIMIENTO DE TIEMPO
  private interval: any = null;;
  private countSeg: number;
  private previousDate: Date | null = null;
  private isActive2: boolean = true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  // Bandera para controlar continueGettingUsers
  private shouldContinueGettingUsers: boolean = false;

  public canChange: any = true;

  public isFromModalUserSearch: boolean = false;

  public formPending: FormGroup;

  public totalUsers: number = 0;

  //Id de suscripcion
  idSubscriptionAuthUser: any = null;

  constructor(private platform: Platform,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
  ) {

    this.isIOS = this.platform.is('ios');
    this.isAndroid = this.platform.is('android');




    this.formOrden = new FormGroup({
      mostValued: new FormControl(false),
      bestValued: new FormControl(false),
      expensiveFirst: new FormControl(false),
      cheapFirst: new FormControl(false),
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
      //vehicleIds: new FormControl(this.vehicleIds),

    });

    this.formPending = new FormGroup({
      pendingUsers: new FormControl([]),

    });



    this.form = new FormGroup({
      // brand: new FormControl(''),
      mostValued: new FormControl(false),
      bestValued: new FormControl(false),
      expensiveFirst: new FormControl(false),
      cheapFirst: new FormControl(false),
      name: new FormControl(this.searchText),
      categoryId: new FormControl(this.categorySelected),
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

  }


  ngOnInit() {

    this.permitirBuscar = true;

    console.log("ahi maod");
    console.log(history.state.form);
    if (history.state.form) {
      const formOrigen = history.state.form;
      this.formOrigen = history.state.form;
    }


    console.log(' form:', this.formOrigen);

    if (history.state.isFromModalUserSearch) {
      this.isFromModalUserSearch = true;
    }





    console.log("ahi maod");

    console.log(history.state.category);
    /*if(history.state.category){
      this.categorySelected=history.state.category; 
      //añado el valor al arrayde ids de categorias
      this.typeCategoryIds.push(this.categorySelected);
      this.form.get('categoryIds').patchValue(this.typeCategoryIds);


      this.updateCategorySelection(this.categorySelected);

      this.categorySelected=-1;
          
    }
    else{
      this.categorySelected=-1;
    }

    this.form.get('categoryId').patchValue(this.categorySelected);*/

    if (history.state.userSelected) {
      this.previousUserSelected = history.state.userSelected;
    }

    if (history.state.form) {

      this.formOrden.get('bestValued')?.setValue(this.formOrigen['bestValued']);
      this.formOrden.get('mostValued')?.setValue(this.formOrigen['mostValued']);
      this.formOrden.get('cheapFirst')?.setValue(this.formOrigen['cheapFirst']);
      this.formOrden.get('expensiveFirst')?.setValue(this.formOrigen['expensiveFirst']);
      this.formDetalles.get('locationValue')?.setValue(this.formOrigen['locationValue']);
      this.formDetalles.get('isFotografiaSelected')?.setValue(this.formOrigen['isFotografiaSelected']);
      this.formDetalles.get('isFilmVideoSelected')?.setValue(this.formOrigen['isFilmVideoSelected']);
      this.formDetalles.get('isTvSelected')?.setValue(this.formOrigen['isTvSelected']);
      this.formDetalles.get('isMusicaSelected')?.setValue(this.formOrigen['isMusicaSelected']);
      this.formDetalles.get('isEventoSelected')?.setValue(this.formOrigen['isEventoSelected']);
      this.formDetalles.get('isTeatroSelected')?.setValue(this.formOrigen['isTeatroSelected']);
      this.formDetalles.get('isOtrosSelected')?.setValue(this.formOrigen['isOtrosSelected']);
      this.formDetalles.get('isSinCategoriaSelected')?.setValue(this.formOrigen['isSinCategoriaSelected']);
      this.formDetalles.get('categoryIds')?.setValue(this.formOrigen['categoryIds']);
      this.formDetalles.get('tags')?.setValue(this.formOrigen['tags']);
      this.formDetalles.get('tagInputValue')?.setValue(this.formOrigen['tagInputValue']);
      this.formDetalles.get('rangePriceValues')?.setValue(this.formOrigen['rangePriceValues']);


      this.searchText = this.formOrigen['name'];
      this.form.get('name')?.setValue(this.formOrigen['name']);


      //ESTE ES EL FORM QUE SE ENVIARA PARA LAS CONSULTAS DE LISTADOS DE USUARIOS
      this.form.get('bestValued')?.setValue(this.formOrigen['bestValued']);
      this.form.get('mostValued')?.setValue(this.formOrigen['mostValued']);
      this.form.get('cheapFirst')?.setValue(this.formOrigen['cheapFirst']);
      this.form.get('expensiveFirst')?.setValue(this.formOrigen['expensiveFirst']);
      this.form.get('rangePrice')?.setValue(this.formOrigen['rangePrice']);
      this.form.get('locationValue')?.setValue(this.formOrigen['locationValue']);
      this.form.get('isFotografiaSelected')?.setValue(this.formOrigen['isFotografiaSelected']);
      this.form.get('isFilmVideoSelected')?.setValue(this.formOrigen['isFilmVideoSelected']);
      this.form.get('isTvSelected')?.setValue(this.formOrigen['isTvSelected']);
      this.form.get('isMusicaSelected')?.setValue(this.formOrigen['isMusicaSelected']);
      this.form.get('isEventoSelected')?.setValue(this.formOrigen['isEventoSelected']);
      this.form.get('isTeatroSelected')?.setValue(this.formOrigen['isTeatroSelected']);
      this.form.get('isOtrosSelected')?.setValue(this.formOrigen['isOtrosSelected']);
      this.form.get('isSinCategoriaSelected')?.setValue(this.formOrigen['isSinCategoriaSelected']);
      this.form.get('categoryIds')?.setValue(this.formOrigen['categoryIds']);
      this.form.get('tags')?.setValue(this.formOrigen['tags']);
      this.form.get('tagInputValue')?.setValue(this.formOrigen['tagInputValue']);
      this.form.get('rangePriceValues')?.setValue(this.formOrigen['rangePriceValues']);


      this.rangePriceMinMax = this.formOrigen['rangePriceValues'];


    }

    this.createTagFromExisting();

    //this.updateCategorySelection(this.categorySelected);




    if (history.state.searchText) {
      this.form.get('name').patchValue(history.state.searchText);
      this.searchText = history.state.searchText;
      this.getUsers();
    }
    else {
      this.getUsers();
    }

    this.getCategoryCounter();
    this.checkAndSelectDefault();

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

  goBack() {
    this.navCtrl.pop()
    // this.navCtrl.navigateBack(history.state.origen);
  }



  onSearchChange($event) {
    // console.log("aplica cambio");
    //this.mostrarListado=true;
    /* this.form.get('name').patchValue(this.searchText);
     
     
      
     if(this.searchText==''){
       this.form.get('name').patchValue('');
     }*/


    //-----
    if (this.searchText != '') {
      this.mostrarListado = true;
      this.form.get('name').patchValue(this.searchText);
      this.getUsers();

    }
    else {
      this.form.get('name').patchValue('');

    }


  }

  onSearchClear() {
    console.log("Se pulsó la X, limpiando búsqueda.");
    Keyboard.hide();
    this.searchText = ''; // Limpia la variable vinculada
    this.mostrarListado = false; // Actualiza el estado relacionado
    this.form.get('name').patchValue(''); // Limpia el valor del formulario si es necesario
    this.getUsers();
  }



  getUsers() {
    // Detener cualquier proceso de continueGettingUsers en curso
    this.shouldContinueGettingUsers = false;

    this.totalUsers = 0;
    console.log("LOS  USUARIOS");

    this.form.get('usersIds').patchValue([]);
    this.availableUsers = [];
    this.untouchedUsers = [];
    //this.form.get('usersIds').setValue([]);

    if (this.searchText == '') {
      this.mostrarListado = false;
    }
    else {
      this.mostrarListado = true;
    }

    // Activar la bandera para permitir continueGettingUsers
    this.shouldContinueGettingUsers = true;


    this.apiService.getUsers(this.form.value).subscribe((result) => {
      if (!this.shouldContinueGettingUsers) {
        return;
      }
      console.log('DATOSs', result);
      //this.availableUsers = result;
      //this.untouchedUsers = result;
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
      this.translate.get('buscador2.No se pudo obtener listado de usuarios').subscribe((translatedText: string) => {
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
        : this.translate.instant('buscador2.Sin tags'); // Traduce 'Sin tags' si no hay etiquetas
  }

  getAbbreviatedName(user): string {
    // Solo abreviar si el sub_id es 1 o 4
    if (this.idSubscriptionAuthUser !== 1 && this.idSubscriptionAuthUser !== 4) {
      // Si el sub_id no es 1 ni 4, devolver el nombre completo
      return user?.name || '';
    }

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



  /*async likeOrUnlike($vehicle,$tienemegusta) {

    this.utilities.getUserId().then((result) => {
    if(result==3){
      this.abrirModal();

    }
    else{

      if($tienemegusta==null){
        this.tienemegusta=1;
        //$tienemegusta=null;
        this.vehicleSelected=$vehicle
        this.vehicleSelected.tienemegusta=['1'];
      }
      else{
        this.tienemegusta=0;
        //$tienemegusta=1;
        this.vehicleSelected=$vehicle
        this.vehicleSelected.tienemegusta=null;
      }
      

      this.apiService.addRemoveLike(this.vehicleSelected.id,this.tienemegusta).subscribe((result)=>{
      
        //console.log(1);
        
      }, error => {
            
            console.log(error);
          });

        
    }
  });
  }*/




  public submitForm(): void {
    this.utilities.showLoading('');
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
        this.access_user_allow = false;
      }


      if (result['userSub'] != null && (result['userSub'] == 3 || result['userSub'] == 6)) {
        this.access_allow = true;
      }
      else {
        this.access_allow = false;
      }


      if (result['userSub'] != null) {
        this.searchbar_allow = true;
      }
      else {
        this.searchbar_allow = false;
      }


    }, error => {

      this.translate.get('buscador2.No se pudo obtener el contador de categorías').subscribe((translatedText: string) => {
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
    this.form.get('categoryIds').setValue(this.typeCategoryIds);
    console.log(this.form.value);
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









  irAPerfilPublico($userId) {
    this.navCtrl.navigateForward("/other-user", { state: { userId: $userId } });
  }



  //-------------DEL BUSCADOR ORIGINAL:-------


  onIonChange(event: any) {
    console.log('Nuevo rango seleccionado (min):', event.detail.value.lower);
    console.log('Nuevo rango seleccionado (max):', event.detail.value.upper);
    console.log('-----------------------------------------');
    if (event.detail.value.lower > event.detail.value.upper) {
      this.rangePriceMinMax = { lower: event.detail.value.upper, upper: event.detail.value.upper };
    }
    else {
      this.rangePriceMinMax = event.detail.value;
    }

    console.log(this.form.get('rangePriceValues').value);
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

  }
























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














  //MODAL ORDEN:
  //---------------------------------------------------------------------------------------

  abrirModalOrden() {
    if (false/*this.filter_allow==false*/) {
      this.navCtrl.navigateForward('my-suscription');
    }
    else {
      console.log("abrir modal orden");
      this.isModalOrden = true;
      this.aplicarCambiosModalOrdenar = false;
    }

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
          if (control !== selected) {
            this.formOrden.get(control).patchValue(false);  // Deselect other checkboxes
            this.form.get(control).patchValue(false);
          }
          else {
            this.form.get(control).patchValue(true);
          }
        });
      }

      console.log(this.formOrden.value);


      this.canChange = true;
    }

  }


  resetOrderForm() {

    //meter los valores del orden que le llegan a la pagina 

    this.formOrden.get('bestValued')?.setValue(this.formOrigen['bestValued']);
    this.formOrden.get('mostValued')?.setValue(this.formOrigen['mostValued']);
    this.formOrden.get('cheapFirst')?.setValue(this.formOrigen['cheapFirst']);
    this.formOrden.get('expensiveFirst')?.setValue(this.formOrigen['expensiveFirst']);

    this.form.get('bestValued')?.setValue(this.formOrigen['bestValued']);
    this.form.get('mostValued')?.setValue(this.formOrigen['mostValued']);
    this.form.get('cheapFirst')?.setValue(this.formOrigen['cheapFirst']);
    this.form.get('expensiveFirst')?.setValue(this.formOrigen['expensiveFirst']);
  }

  cerrarModalOrden($modalOrden) {
    console.log('funcion cerrar modal orden');
    this.isModalOrden = false;

    if (this.aplicarCambiosModalOrdenar == true) {
      this.form.get('bestValued')?.setValue(this.formOrden.get('bestValued').value);
      this.form.get('mostValued')?.setValue(this.formOrden.get('mostValued').value);
      this.form.get('cheapFirst')?.setValue(this.formOrden.get('cheapFirst').value);
      this.form.get('expensiveFirst')?.setValue(this.formOrden.get('expensiveFirst').value);

      this.getUsers();
    }
    else {
      //vuelvo a poner a los valores del formulario original
      this.formOrden.get('bestValued')?.setValue(this.form.get('bestValued').value);
      this.formOrden.get('mostValued')?.setValue(this.form.get('mostValued').value);
      this.formOrden.get('cheapFirst')?.setValue(this.form.get('cheapFirst').value);
      this.formOrden.get('expensiveFirst')?.setValue(this.form.get('expensiveFirst').value);

    }
  }


  aplicarModalOrden($modalOrden) {
    this.aplicarCambiosModalOrdenar = true;
    $modalOrden.dismiss();
    this.isModalOrden = false;
    console.log(this.form.value);
    this.mostrarListadoFiltros = true;
  }


















  //MODAL DETALLES
  //---------------------------------------------------------------


  createTagFromExisting() {
    this.tags = [];
    // Obtener el listado actual de tags desde 'tags' en el formulario
    const existingTags = this.formDetalles.get('tags')?.value || [];

    if (existingTags.length > 0) {
      // Iterar sobre cada tag y añadirlo a this.tags
      existingTags.forEach(tag => {
        if (tag && !this.tags.includes(tag)) {
          this.tags.push(tag);
        }
      });

      console.log('Tags añadidos a this.tags:', this.tags);

      // Mostrar mensaje de confirmación

    } else {
      // Mostrar mensaje si no hay tags existentes

    }
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
        this.translate.get('buscador2.Ya hay un Tag con ese valor').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText);
        });
      }

    }
    else {
      this.translate.get('buscador2.El campo está vacío, no se puede crear un Tag').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
    }

  }

  deleteTag(tag: string) {
    this.tags = this.tags.filter(t => t !== tag);
    this.formDetalles.get('tags')?.patchValue(this.tags);
  }




  abrirModalDetalles() {
    if (false/*this.filter_allow==false*/) {
      this.navCtrl.navigateForward('my-suscription');
    }
    else {
      console.log("abrir modal Detalles");
      this.isModalDetalles = true;
      this.aplicarCambiosModalDetalles = false;

      setTimeout(() => {

        this.initAutocomplete();

        //
      }, 1000);

    }

  }

  aplicarModalDetalles($modalDetalles) {
    console.log("aplicar modal Detalles");
    this.form.get('rangePriceValues')?.setValue(this.rangePriceMinMax);
    this.aplicarCambiosModalDetalles = true;
    $modalDetalles.dismiss();
    this.isModalDetalles = false;


  }






  cerrarModalDetalles($modalDetalles) {

    console.log('funcion cerrar modal detalles');
    this.isModalDetalles = false;
    console.log(this.form.value);


    if (this.aplicarCambiosModalDetalles == true) {
      this.form.get('rangePrice')?.setValue(this.formDetalles.get('rangePrice').value);
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

      this.getUsers();
    }
    else {
      //vuelvo a poner a los valores del formulario original
      this.formDetalles.get('rangePrice')?.setValue(this.form.get('rangePrice').value);
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


      this.createTagFromExisting();



    }

  }






  resetFormDetalles() {

    this.formDetalles.get('locationValue')?.setValue('');
    this.formDetalles.get('isFotografiaSelected')?.setValue(false);
    this.formDetalles.get('isFilmVideoSelected')?.setValue(false);
    this.formDetalles.get('isTvSelected')?.setValue(false);
    this.formDetalles.get('isMusicaSelected')?.setValue(false);
    this.formDetalles.get('isEventoSelected')?.setValue(false);
    this.formDetalles.get('isTeatroSelected')?.setValue(false);
    this.formDetalles.get('isOtrosSelected')?.setValue(false);
    this.formDetalles.get('isSinCategoriaSelected')?.setValue(false);
    this.formDetalles.get('categoryIds')?.setValue([]);
    this.formDetalles.get('tags')?.setValue([]);
    this.formDetalles.get('tagInputValue')?.setValue('');


    this.rangePrice = 0;
    this.rangePriceMinMax = { lower: 0, upper: 2001 };
    this.tags = [];
    this.typeCategoryIds = [];



    this.form.get('rangePrice')?.setValue({ lower: 0, upper: 2001 });
    this.form.get('locationValue')?.setValue('');
    this.form.get('isFotografiaSelected')?.setValue(false);
    this.form.get('isFilmVideoSelected')?.setValue(false);
    this.form.get('isTvSelected')?.setValue(false);
    this.form.get('isMusicaSelected')?.setValue(false);
    this.form.get('isEventoSelected')?.setValue(false);
    this.form.get('isTeatroSelected')?.setValue(false);
    this.form.get('isOtrosSelected')?.setValue(false);
    this.form.get('isSinCategoriaSelected')?.setValue(false);
    this.form.get('categoryIds')?.setValue([]);
    this.form.get('tags')?.setValue([]);
    this.form.get('tagInputValue')?.setValue('');



    this.formDetalles.get('rangePriceValues')?.setValue({ lower: 0, upper: 2001 });
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

    this.form.get('name').patchValue('');
    this.searchText = '';

    this.createTagFromExisting();

    if (!this.isFromModalUserSearch) {
      this.reviseCategories();
    }


  }

  reviseCategories() {
    const categoryKeys = [
      'isFotografiaSelected',
      'isFilmVideoSelected',
      'isTvSelected',
      'isMusicaSelected',
      'isEventoSelected',
      'isTeatroSelected',
      'isOtrosSelected',
      'isSinCategoriaSelected'
    ];

    // Buscar la primera categoría seleccionada en formOrigen
    console.log("ANTES");
    const selectedCategory = categoryKeys.find(key => this.formOrigen[key] === true) || '';
    console.log(selectedCategory);
    console.log("<<<----->>>");
    // Asignar el nombre de la categoría al campo categoryDefaultSelected
    if (selectedCategory != '') {
      this.form.get(selectedCategory)?.setValue(true);
      this.formDetalles.get(selectedCategory)?.setValue(true);
    }



  }






  //LISTADO DE USUSARIOS
  //----------------------------------------------------------------------


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
      //this.resetFormDetalles();
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
          this.resetFormDetalles();
        }
        else if (result['state'] == "DONTACCESS") {

          this.translate.get('buscador2.Ya hay una solicitud enviada pendiente de aceptar').subscribe((translatedText: string) => {
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
          this.resetFormDetalles();

        }
        else {

          this.translate.get('buscador2.Resultado desconocido').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText);
          });
        }



      }, error => {

        this.translate.get('buscador2.No se pudo comprobar la existencia de la solicitud').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText);
        });
        console.log(error);
      });

    }

  }



  getStarColor(index: number, average: any): string {

    if (average === 0 || average === null || average === undefined) {
      // Si no hay valoración, las tres primeras estrellas son activas
      return index < 3 ? 'assets/icons/estrella-valoracion.svg' : 'assets/icons/estrella-gris.svg';
    }

    const fractional = average - index;

    if (fractional >= 1) {
      // Star is fully filled
      console.log("ENTRA ACTIVA");
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

  goNotifications() {

    this.navCtrl.navigateForward("/notifications");
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
        if (!event.url.includes('/buscador2')) {
          //console.log('Saliendo de buscador2, limpiando intervalos');
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
      this.apiService.registerTimeScreen({ screenId: 4, screenTime: this.countSeg }).subscribe((result) => {
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
      console.log(`buscador2: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({ screenId: 4, screenTime: this.countSeg }).subscribe((result) => {
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
      console.log(`buscador2: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    }
    else {
      console.log('buscador2: No hay fecha anterior, usando la actual como inicial.');
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
    /*const input = event.target as HTMLInputElement;
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


    let titleText = this.translate.instant('buscador2.Sin Suscripción válida');
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

    modal.onDidDismiss().then((data) => {

      console.log(data);
      let noBack = (data.data?.noBack);
      console.log('HAY QUE VOLVER ATRAS', noBack);
      if (!noBack) {
        this.navCtrl.pop()
      }


    });

    return await modal.present();
  }




  onIonInfiniteJobs(ev) {
    //if(this.totalUsers==this.availableUsers.length){
    // console.log('-----------llego al final---------------');
    //this.getMoreUsers();
    // console.log(ev);
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
    // }
  }



  goFollows() {
    this.navCtrl.navigateForward("users-follow");
  }
}

