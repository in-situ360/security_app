import { Component, OnInit } from '@angular/core';
import {ModalController, NavController,Platform } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { User } from 'src/app/models/User';


import { Keyboard } from '@capacitor/keyboard';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { RangePriceModalPage } from '../range-price-modal/range-price-modal.page';
import { InfoModalPage } from '../info-modal/info-modal.page';

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

declare var google; //GOOGLEPLACE

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.page.html',
  styleUrls: ['./buscador.page.scss'],
})
export class BuscadorPage implements OnInit {


  public projects:any=[];
  public users:User[]=[];


  public usersList: any = [];
  public usersListIds: any = [];
  public formCatList: FormGroup;//el que se envia para obtener usuarios del listado de categoria

  public access_user_allow:boolean=false;
  public access_allow:boolean=false;
  public searchbar_allow:boolean=false;
  public filter_allow:boolean=false;
  isAndroid: boolean = false;
  isIOS: boolean = false;

  @ViewChild('mySlider') slider: IonSlides;

  public actu:any=false;

  public banner:any=null;

  slideOptions = {
    direction: 'horizontal',
    slidesPerView: 'auto',
  };

  public searchText='';//para encontrar empresas

  public advertisedUsers:any=[];

  public availableUsers:any = [];
  public untouchedUsers:any=[];
  public usersIds: any = [];
  public userSelected:any=null;
  public mostrarListado=false;
  public permitirBuscar:any=false;

  public categorySelected:any=-1;
  public rangePrice:any=0;
  public rangePriceMinMax:any={ lower: 0, upper: 2001 };


  public previousUserSelected:any=null;



  mostrarListadoFiltros:boolean=false; 
  
  
  public formOrigen:any;//lo que viene de las otras paginas
  public form: FormGroup;//el que se envia para obtener usuarios
  public formOrden: FormGroup;//el del modal orden (si se da a buscar se les pasara sus valores a 'form', si no se resetearan)
  public formDetalles: FormGroup;//el del modal detalles (si se da a buscar se les pasara sus valores a 'form', si no se resetearan)


  public typeCategoryIds:any = [];


  public fotografiaCount:any=0;
  public filmVideoCount:number=0;
  public tvCount:number=0;
  public musicaCount:number=0;
  public eventoFiestaCount:number=0;
  public teatroCount:number=0;
  public otrosCount:number=0;
  public sinCategoriaCount:number=0;

  public tags:any=[];




  //modal ordenar
  public aplicarCambiosModalOrdenar:boolean= false;//para cuando se cierre se decida si es para aplicar cambios o dejar los valores como antes de abrir el modal
  public isModalOrden = false;//nuevo



  //modal detalles
  public aplicarCambiosModalDetalles:boolean= false;
  public isModalDetalles = false;

  rating: any = 0;

  stars: Array<number> = [0, 1, 2, 3, 4];


  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  public canChange:any=true;

  constructor(private platform: Platform,
    private apiService: ApiService, 
    private utilities: UtilitiesService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
  ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

    this.formCatList = new FormGroup({
      usersIds:new FormControl([]), 
      selectedCategory:new FormControl(''),      
    });


    this.formOrden = new FormGroup({
      mostValued:new FormControl(false),
      bestValued:new FormControl(false),
      expensiveFirst: new FormControl(false),
      cheapFirst: new FormControl(false),
    });



    this.formDetalles = new FormGroup({
       rangePriceValues:new FormControl({ lower: 0, upper: 2001 }),
       locationValue:new FormControl(''),
       isFotografiaSelected:new FormControl(false),
       isFilmVideoSelected:new FormControl(false),
       isTvSelected:new FormControl(false),
       isMusicaSelected:new FormControl(false),
       isEventoSelected:new FormControl(false),
       isTeatroSelected:new FormControl(false),
       isOtrosSelected:new FormControl(false),
       isSinCategoriaSelected:new FormControl(false),
       categoryIds: new FormControl(this.typeCategoryIds),
       tags: new FormControl(this.tags),
       tagInputValue:new FormControl(''),
       //vehicleIds: new FormControl(this.vehicleIds),
       
    });



    this.form = new FormGroup({
      // brand: new FormControl(''),
       mostValued:new FormControl(false),
       bestValued:new FormControl(false),
       expensiveFirst: new FormControl(false),
       cheapFirst: new FormControl(false),
       name:new FormControl(this.searchText),
       categoryId:new FormControl(this.categorySelected),
       rangePriceValues:new FormControl({ lower: 0, upper: 2001 }),
       locationValue:new FormControl(''),
       isFotografiaSelected:new FormControl(false),
       isFilmVideoSelected:new FormControl(false),
       isTvSelected:new FormControl(false),
       isMusicaSelected:new FormControl(false),
       isEventoSelected:new FormControl(false),
       isTeatroSelected:new FormControl(false),
       isOtrosSelected:new FormControl(false),
       isSinCategoriaSelected:new FormControl(false),
       categoryIds: new FormControl(this.typeCategoryIds),
       tags: new FormControl(this.tags),
       tagInputValue:new FormControl(''),
       usersIds:new FormControl([]), 
       categoryDefaultSelected:new FormControl(''),
       //vehicleIds: new FormControl(this.vehicleIds),
       
    });
  }

  ngOnInit() {

    

    this.permitirBuscar = true;

    console.log("ahi maod");
    console.log(history.state.form);
    const formOrigen = history.state.form;

    this.formOrigen=history.state.form;
    
      
    
    console.log("ahi maod");

    console.log(history.state.category);


    if(history.state.userSelected){
      this.previousUserSelected=history.state.userSelected;      
    }

    

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


    this.searchText=this.formOrigen['name'];
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

    console.log('rangePriceValues');
    console.log(this.formOrigen['rangePriceValues']);
    this.formDetalles.get('rangePriceValues')?.setValue(this.formOrigen['rangePriceValues']);


    this.createTagFromExisting();

    //this.updateCategorySelection(this.categorySelected);


    

    if(history.state.searchText){
      this.form.get('name').patchValue(history.state.searchText);
      this.searchText=history.state.searchText;   

    }
    else{
      this.getUsers();
    }

    this.getCategoryCounter();




//this.categorySelected

    

    /*this.apiService.getFirstsProjectsAndUsersPay({}).subscribe((result) => {
      console.log('DATOS',result);
      this.projects=result['projects'];//concadenar listado vehiculos
      this.users=result['users'];
     

    }, error => {
     // this.utilities.showToast('');
      console.log(error);
    });*/



    this.actu=true;

    if(history.state.searchText){
      this.searchText=history.state.searchText;      
    }

    console.log(history.state.category);
    if(history.state.category){
      this.categorySelected=history.state.category;      
    }
    else{
      this.categorySelected=-1;
    }

    if(history.state.userSelected){
      this.previousUserSelected=history.state.userSelected;      
    }

    this.checkAndSelectDefault();


    setTimeout(() => {
      this.permitirBuscar = true;
      console.log('permitirBuscar:', this.permitirBuscar); // Para verificar que el valor ha cambiado
    }, 1000); 


    this.apiService.userFollow$.subscribe(([userId, followData]) => {
      if (userId !== null) {
        // Aquí actualizas el estado de los usuarios al recibir el cambio
        this.updateUserFollowStatus(userId, followData);
      }
    });






    this.getCategoryListUsers();

    const selectedKey = this.getSelectedCategoryKey();
   // this.utilities.showToast(selectedKey);
    
    this.apiService.obtainBannerByCategory({selectedKey:selectedKey}).subscribe((result) => {
      
      this.banner=result;
      console.log("el puto banner",this.banner);
     

    }, error => {
     // this.utilities.showToast('');
      console.log(error);
    });

    this.apiService.obtainAdvertisedUserByCategory({selectedKey:selectedKey}).subscribe((result) => {
      
      this.advertisedUsers=result;
      
     

    }, error => {
     // this.utilities.showToast('');
      console.log(error);
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
      if (prefijo==null) {
        console.log("No idioma");
        this.utilities.saveLang('en');
  
        
      } else {
        
        this.switchLanguage(prefijo || 'en');
      }
    });

   /* this.apiService.getEntity('advertised-users').subscribe((result: any) => {
      console.log('anuncios:',result);
      this.advertisedUsers=result;

    }, error => {
      
    });*/

  //  this.obtainBanner();
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    
  }


  goBack(){
    this.navCtrl.pop();
    // this.navCtrl.navigateBack(history.state.origen);
  }

  async onSlideReachEnd() {
    if(this.actu==true){
      this.actu=false;
      console.log('FIN SLIDER');
      //this.getMoreCategoryListUsers();
    }
    
    
  }




  

  getUserLabels(user): string {
    // Primero verifica si existe translateUserLabels y contiene elementos
    return user?.translateUserLabels && user.translateUserLabels.length > 0
      ? user.translateUserLabels.map(label => label.value).join(', ')
      : user?.allmylabels && user.allmylabels.length > 0
        ? user.allmylabels.map(label => label.value).join(', ')
        : this.translate.instant('buscador.Sin tags'); // Traduce 'Sin tags' si no hay etiquetas
  }


  goToBuscador2(){
   /*this.mostrarListado=false;
    console.log('-------');
    console.log(this.categorySelected);
    console.log('-------');
    this.navCtrl.navigateForward("/buscador2", {state: {category:this.categorySelected,searchText:this.searchText,userSelected:null}});*/
    this.reviseCategories();
    this.navCtrl.navigateForward("/buscador2", {state: {form: this.form.value,searchText:this.searchText,userSelected:this.userSelected}});
    this.resetFormDetalles();

  }

  
  selectEmp($usuario){

    if(!this.access_user_allow){
      this.abrirModalInvitado();
    }
    else{

      console.log($usuario);
      this.userSelected=$usuario;
      this.mostrarListado=false;
      //this.navCtrl.navigateForward("/buscador2", {state: {/*category:null,*/searchText:this.searchText,userSelected:this.userSelected}});
      this.navCtrl.navigateForward("/other-user", {state: {userId:this.userSelected.id}});
      this.resetFormDetalles();
    }
  }




  goToProject(index: number): void{

    
    const pro = this.projects[index];
    if (pro) {
      console.log('Navigating to folder:', pro);
      this.navCtrl.navigateForward("/detail-proyect", {state: {projectSelected:this.projects[index].id}});

      
    } else {
      
      
      console.log('proyecto no existe para este índice:', index);
      
    }
  
}

irAPerfilPublico($userId){
  if($userId!=null && $userId!=''){
    this.navCtrl.navigateForward("/other-user", { state: { userId: $userId } });
    this.resetFormDetalles();
  }
  
}





onSearchChange($event) {
  console.log("aplica cambio");
  //this.mostrarListado=true;
  this.form.get('name').patchValue(this.searchText);
  //this.getUsers();
  
  if(this.searchText==''){
    this.form.get('name').patchValue('');
  }
   
   

 }

 onSearchClear() {
  console.log("Se pulsó la X, limpiando búsqueda.");
  this.searchText = ''; // Limpia la variable vinculada
  Keyboard.hide();
  this.mostrarListado = false; // Actualiza el estado relacionado
  this.form.get('name').patchValue(''); // Limpia el valor del formulario si es necesario
}

 

 getUsers(){
    this.form.get('usersIds').patchValue([]);
    this.availableUsers = [];
    this.untouchedUsers = [];
   this.apiService.getUsers(this.form.value).subscribe((result) => {
    this.availableUsers = result['users'];
    this.untouchedUsers = result['users'];
    this.usersIds=result['usersIds'];
    this.form.get('usersIds').patchValue(this.usersIds);
   }, error => {
    this.translate.get('buscador.No se pudo obtener listado de usuarios').subscribe((translatedText: string) => {
      this.utilities.showToast(translatedText); 
    });
     console.log(error);
   });

 }

 getMoreUsers(){
    this.apiService.getUsers(this.form.value).subscribe((result) => {
      console.log('DATOS',result);
      this.availableUsers = this.availableUsers.concat(result['users']);
      this.untouchedUsers = this.untouchedUsers.concat(result['users']);
      this.usersIds=this.usersIds.concat(result['usersIds']);
      this.form.get('usersIds').patchValue(this.usersIds);
      
    
    }, error => {
    this.translate.get('buscador2.No se pudo obtener listado de usuarios').subscribe((translatedText: string) => {
      this.utilities.showToast(translatedText); 
    });
      console.log(error);
    });

  }



 public submitForm(): void {
  this.utilities.showLoading('');
  console.log(this.form.value);
  this.getUsers();
}

async abrirModalInfo(){
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


getCategoryCounter(){
  this.apiService.getCategoryCounter({}).subscribe((result)=>{
    console.log(result);
    
    this.fotografiaCount=result['fotografiaCount'];
    this.filmVideoCount=result['filmVideoCount'];
    this.tvCount=result['tvCount'];
    this.musicaCount=result['musicaCount'];
    this.eventoFiestaCount=result['eventoFiestaCount'];
    this.teatroCount=result['teatroCount'];
    this.otrosCount=result['otrosCount'];
    this.sinCategoriaCount=result['sinCategoriaCount'];

    if(result['userSub']!=null && result['userSub']!=1 && result['userSub']!=4){
      this.filter_allow=true;
      this.access_user_allow=true;
    }
    else{
      this.filter_allow=false;
      this.access_user_allow=false;
    }

    if(result['userSub']!=null){
      this.searchbar_allow=true;
    }
    else{
      this.searchbar_allow=false;
    }

    if(result['userSub']!=null && (result['userSub']==3 || result['userSub']==6)){
      this.access_allow=true;
    }
    else{
      this.access_allow=false;
    }

    
   
  }, error => {
    
    this.translate.get('buscador.No se pudo obtener el contador de categorías').subscribe((translatedText: string) => {
      this.utilities.showToast(translatedText); 
    });
        console.log(error);
      });


}


onCategoryChange(categoryId: number, evento: any): void {
 const isSelected= evento.detail.checked;
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


onIonChange(event: any) {
  console.log('Nuevo rango seleccionado (min):', event.detail.value.lower);
  console.log('Nuevo rango seleccionado (max):', event.detail.value.upper);
  console.log('-----------------------------------------');
  if (event.detail.value.lower > event.detail.value.upper) {
    this.rangePriceMinMax={ lower: event.detail.value.upper, upper: event.detail.value.upper };
  } 
  else {
    this.rangePriceMinMax=event.detail.value; 
  }

  console.log(this.form.get('rangePriceValues').value);
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

}


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

    this.mostrarListado=true;
    this.form.get('name').patchValue(this.searchText);
    this.getUsers();
    
    
    if(this.searchText==''){
      this.mostrarListado=false;
      this.form.get('name').patchValue('');
    }
  }
  
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




//MODAL ORDEN:
  //---------------------------------------------------------------------------------------

  abrirModalOrden() {

    if(false/*this.filter_allow==false*/){
      this.navCtrl.navigateForward('my-suscription');
    }
    else{
      console.log("abrir modal orden");
      this.isModalOrden = true;
      this.aplicarCambiosModalOrdenar=false;
    }
    
  }


  onCheckboxChange(selected: string) {

    if(this.canChange){

      this.canChange=false;
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
          else{
            this.form.get(control).patchValue(true);
          }
        });
      }

      console.log(this.formOrden.value);

      this.canChange=true;
    }
  }


  resetOrderForm(){

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

  cerrarModalOrden($modalOrden){
    console.log('funcion cerrar modal orden');
    this.isModalOrden = false;
    
    if(this.aplicarCambiosModalOrdenar==true){
      this.form.get('bestValued')?.setValue(this.formOrden.get('bestValued').value);
      this.form.get('mostValued')?.setValue(this.formOrden.get('mostValued').value);
      this.form.get('cheapFirst')?.setValue(this.formOrden.get('cheapFirst').value);
      this.form.get('expensiveFirst')?.setValue(this.formOrden.get('expensiveFirst').value);

      this.getUsers();
    }
    else{
      //vuelvo a poner a los valores del formulario original
      this.formOrden.get('bestValued')?.setValue(this.form.get('bestValued').value);
      this.formOrden.get('mostValued')?.setValue(this.form.get('mostValued').value);
      this.formOrden.get('cheapFirst')?.setValue(this.form.get('cheapFirst').value);
      this.formOrden.get('expensiveFirst')?.setValue(this.form.get('expensiveFirst').value);

    }
  }


  aplicarModalOrden($modalOrden){
    this.aplicarCambiosModalOrdenar=true;
    $modalOrden.dismiss();
    this.isModalOrden = false;
    console.log(this.form.value);
    this.mostrarListadoFiltros=true;
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




  createTag(){
    console.log(this.formDetalles.get('tagInputValue')?.value);
    const tag = (this.formDetalles.get('tagInputValue')?.value).trim();
    const tag2=(this.formDetalles.get('tagInputValue')?.value.trim()).toLowerCase()
    if (tag) {
      if(!this.tags.map(tag => tag.toLowerCase()).includes(tag2)){
      this.tags.push(tag);
      this.formDetalles.get('tags').patchValue(this.tags);
      console.log(this.formDetalles.get('tags'));
      this.formDetalles.get('tagInputValue')?.setValue('');
      //this.form.get('tagInputValue')?.reset();
      }
      else{
        console.log('Ya hay un Tag con ese valor.'); 
        this.translate.get('buscador.Ya hay un Tag con ese valor').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
      }
      
    } 
    else {
      this.translate.get('buscador.El campo está vacío, no se puede crear un Tag').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
    }

  }

  deleteTag(tag: string) {
    this.tags = this.tags.filter(t => t !== tag);
    this.formDetalles.get('tags')?.patchValue(this.tags);
  }




  abrirModalDetalles() {
    if(/*this.filter_allow==false*/false){
      this.navCtrl.navigateForward('my-suscription');
    }
    else{
      console.log("abrir modal Detalles");
      this.isModalDetalles = true;
      this.aplicarCambiosModalDetalles=false;

      setTimeout(() => {

        this.initAutocomplete();

        //
      }, 1000);
    }
   
    
  }

  aplicarModalDetalles($modalDetalles){
    console.log("aplicar modal Detalles");
    this.form.get('rangePriceValues')?.setValue(this.rangePriceMinMax);
    this.aplicarCambiosModalDetalles=true;
    $modalDetalles.dismiss();
    this.isModalDetalles = false;
   
   
  }



  


  cerrarModalDetalles($modalDetalles){
    
    console.log('funcion cerrar modal detalles');
    this.isModalDetalles = false;
    console.log(this.form.value);


    if(this.aplicarCambiosModalDetalles==true){
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
      this.form.get('locationValue')?.setValue(this.formDetalles.get('locationValue').value);
     // this.getUsers();
     this.reviseCategories();
     this.navCtrl.navigateForward("/buscador2", {state: {form: this.form.value,searchText:this.searchText,userSelected:this.userSelected}});
     this.resetFormDetalles();

    }
    else{
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






  resetFormDetalles(){

    this.formDetalles.get('locationValue')?.setValue('');
    
    /*this.formDetalles.get('isFotografiaSelected')?.setValue(false);
    this.formDetalles.get('isFilmVideoSelected')?.setValue(false);
    this.formDetalles.get('isTvSelected')?.setValue(false);
    this.formDetalles.get('isMusicaSelected')?.setValue(false);
    this.formDetalles.get('isEventoSelected')?.setValue(false);
    this.formDetalles.get('isTeatroSelected')?.setValue(false);
    this.formDetalles.get('isOtrosSelected')?.setValue(false);
    this.formDetalles.get('isSinCategoriaSelected')?.setValue(false);*/
    this.formDetalles.get('categoryIds')?.setValue([]);
    this.formDetalles.get('tags')?.setValue([]);
    this.formDetalles.get('tagInputValue')?.setValue('');


    
    this.formDetalles.get('isFotografiaSelected')?.setValue(this.formOrigen['isFotografiaSelected']);
    this.formDetalles.get('isFilmVideoSelected')?.setValue(this.formOrigen['isFilmVideoSelected']);
    this.formDetalles.get('isTvSelected')?.setValue(this.formOrigen['isTvSelected']);
    this.formDetalles.get('isMusicaSelected')?.setValue(this.formOrigen['isMusicaSelected']);
    this.formDetalles.get('isEventoSelected')?.setValue(this.formOrigen['isEventoSelected']);
    this.formDetalles.get('isTeatroSelected')?.setValue(this.formOrigen['isTeatroSelected']);
    this.formDetalles.get('isOtrosSelected')?.setValue(this.formOrigen['isOtrosSelected']);
    this.formDetalles.get('isSinCategoriaSelected')?.setValue(this.formOrigen['isSinCategoriaSelected']);




   
    this.form.get('rangePrice')?.setValue({ lower: 0, upper: 2001 });
    this.form.get('locationValue')?.setValue('');
    /*this.form.get('isFotografiaSelected')?.setValue(false);
    this.form.get('isFilmVideoSelected')?.setValue(false);
    this.form.get('isTvSelected')?.setValue(false);
    this.form.get('isMusicaSelected')?.setValue(false);
    this.form.get('isEventoSelected')?.setValue(false);
    this.form.get('isTeatroSelected')?.setValue(false);
    this.form.get('isOtrosSelected')?.setValue(false);
    this.form.get('isSinCategoriaSelected')?.setValue(false);*/
    this.form.get('categoryIds')?.setValue([]);
    this.form.get('tags')?.setValue([]);
    this.form.get('tagInputValue')?.setValue('');

    this.form.get('isFotografiaSelected')?.setValue(this.formOrigen['isFotografiaSelected']);
    this.form.get('isFilmVideoSelected')?.setValue(this.formOrigen['isFilmVideoSelected']);
    this.form.get('isTvSelected')?.setValue(this.formOrigen['isTvSelected']);
    this.form.get('isMusicaSelected')?.setValue(this.formOrigen['isMusicaSelected']);
    this.form.get('isEventoSelected')?.setValue(this.formOrigen['isEventoSelected']);
    this.form.get('isTeatroSelected')?.setValue(this.formOrigen['isTeatroSelected']);
    this.form.get('isOtrosSelected')?.setValue(this.formOrigen['isOtrosSelected']);
    this.form.get('isSinCategoriaSelected')?.setValue(this.formOrigen['isSinCategoriaSelected']);


    this.formDetalles.get('rangePriceValues')?.setValue({ lower: 0, upper: 2001 });
    this.form.get('rangePriceValues')?.setValue({ lower: 0, upper: 2001 });
    this.rangePriceMinMax={ lower: 0, upper: 2001 };

    this.typeCategoryIds = [];
    this.tags=[];
  
    this.formOrden.get('bestValued').patchValue(true);
    this.formOrden.get('mostValued').patchValue(false); 
    this.formOrden.get('cheapFirst').patchValue(false); 
    this.formOrden.get('expensiveFirst').patchValue(false);

    this.form.get('bestValued').patchValue(true);
    this.form.get('mostValued').patchValue(false); 
    this.form.get('cheapFirst').patchValue(false); 
    this.form.get('expensiveFirst').patchValue(false);

    

    this.createTagFromExisting();

    this.form.get('name').patchValue('');
    this.searchText='';
    
  }






  //LISTADO DE USUSARIOS
  //----------------------------------------------------------------------


  

  conectUser($usuario){

    if(!this.access_user_allow){
      this.abrirModalInvitado();
    }
    else{

      console.log($usuario);
      //this.navCtrl.navigateForward("/tabs/home"/*, {state: {searchText:this.searchText,userSelected:this.userSelected}}*/);
      //controlRequest
      this.apiService.controlRequest({userId:$usuario.id}).subscribe((result) => {
        console.log('DATOS',result);
        if(result['state']=="ACCESS"){
          this.navCtrl.navigateForward("/conectar", {state: {user:$usuario}});
          
        }
        else if(result['state']=="DONTACCESS"){
          
          this.translate.get('buscador.Ya hay una solicitud enviada pendiente de aceptar').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
        }
        else if(result['state']=="GOCHAT"){
          console.log('debe ir al chat');
          this.navCtrl.navigateForward('interior-chat', { state: { id_chat:result['chat'].id,
            nombre_chat:$usuario.name,
            ultimo_mensaje:null,
            avatar:$usuario.avatar,
            telNumber: null,
            userId:$usuario.id
          } });
          

        }
        else{
          
          this.translate.get('buscador.Resultado desconocido').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
        }
        


      }, error => {
      
        this.translate.get('buscador.No se pudo comprobar la existencia de la solicitud').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        console.log(error);
      });

    }
    
  }
  

  getStarColor(index: number, average:any): string {

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

  isActive(index: number, average:any): boolean {
    return index < average;
  }

  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
        console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
        //this.startInterval();
      }
      else{
        //this.clearInterval();

      }
      
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Verifica si la ruta actual no es '/UserSearch'
        if (event.url!='/buscador') {
         // console.log('Saliendo de /buscador, limpiando intervalos');
          //this.clearInterval();
        }
        else{
          //this.startInterval();
        }
      }
    });

   

    if(this.interval==null){
      //this.startInterval();
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
      this.apiService.registerTimeScreen({screenId:3,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`/buscador: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:3,screenTime:this.countSeg}).subscribe((result) => {
        console.log('DATOS',result);
        
      }, error => {
        
        console.log(error);
      });

      //this.clearInterval();
      return;
    }

   

   
    if (this.isActive2) {
      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg=this.countSeg+differenceInSeconds;
      console.log(`/buscador: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('/buscador: No hay fecha anterior, usando la actual como inicial.');
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



  initAutocomplete() { 
    const input = document.getElementById('searchTextField')as HTMLInputElement;
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


  async abrirModalInvitado(){


    let titleText=this.translate.instant('buscador.Sin Suscripción válida');
    let infoText=this.translate.instant('Para acceder a toda la información del usuario y contactarlo, suscríbete al Plan S o al Plan 360.');

    const modal = await this.modalCtrl.create({
      component: InvitadoModalPage,
      cssClass: 'InvitadoMensajeModal',
      componentProps: {
       title:titleText,
       info:infoText,
       showButton:true
        
        
      },
     // backdropDismiss:false
    });

    modal.onDidDismiss().then((data) => {
       
       console.log(data);
       let noBack = (data.data?.noBack); 
       console.log('HAY QUE VOLVER ATRAS',noBack);
       if(!noBack){
        this.navCtrl.pop();
       }

    
    });
    return await modal.present();
  }






  follow($user){
    if($user?.hasFollow!=null){
      console.log("QUITAR");
      this.apiService.followUnfollow({userId:$user.id,opc:1}).subscribe((result) => {
        console.log('DATOS',result);
        
        $user.hasFollow = null;
        this.apiService.changeHasFollowInUser($user.id,null);
    }, error => {
        this.utilities.showToast('');
        console.log(error);
    });

    }
    else{

      console.log("GUARDAR");
      this.apiService.followUnfollow({userId:$user.id,opc:2}).subscribe((result) => {
        console.log('DATOS',result);
       
        $user.hasFollow =result;
        this.apiService.changeHasFollowInUser($user.id,result);
    }, error => {
        this.utilities.showToast('');
        console.log(error);
    });

    }
      


  }


  reviseCategories(){
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
    this.form.get('categoryDefaultSelected')?.setValue(selectedCategory);
    
    
  }



  getCategoryListUsers(){
   /* const categoryKeys = [
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
    
    const selectedCategory = categoryKeys.find(key => this.formOrigen[key] === true) || '';
    console.log(selectedCategory);*/
    

    this.formCatList.get('selectedCategory').patchValue(/*selectedCategory*/this.getSelectedCategoryKey());
    //this.utilities.showToast(this.formCatList.get('selectedCategory').value);
    this.actu=false;
    
    this.apiService.getCategoryListUsers(this.formCatList.value).subscribe((result) => {
      console.log('Usuarios nuevos del listado: ',result);
      this.usersList = this.usersList.concat(result['users']);
     // this.usersListIds=this.usersListIds.concat(result['usersIds']);
      //this.formCatList.get('usersIds').patchValue(this.usersListIds);
    
      this.actu=true;
    
    }, error => {
    
      this.actu=true;
      console.log(error);
    });
    
    
  }



  getMoreCategoryListUsers(){
    this.apiService.getCategoryListUsers(this.formCatList.value).subscribe((result) => {
      console.log('Usuarios nuevos del listado: ',result);
      this.usersList = this.usersList.concat(result['users']);
      this.usersListIds=this.usersListIds.concat(result['usersIds']);
      this.formCatList.get('usersIds').patchValue(this.usersListIds);
    
      this.actu=true;
    
    }, error => {
    
      this.actu=true;
      console.log(error);
    });

  }




  onIonInfiniteJobs(ev) {
        console.log('-----------llego al final---------------');
         this.getMoreUsers();
        console.log(ev);
        setTimeout(() => {
          (ev as InfiniteScrollCustomEvent).target.complete();
        }, 500);
      }


      goFollows(){
        this.navCtrl.navigateForward("users-follow");
      }


      public obtainBanner(){

        this.apiService.obtainBanner().subscribe((result)=>{
          console.log('banner:',result);
          this.banner=result;
          
    
        }, error => {
             
              console.log(error);
            });
      }


      getSelectedCategoryKey(): string | null {
        const categoryMap: { [key: string]: string } = {
          isFotografiaSelected: "1",
          isFilmVideoSelected: "2",
          isTvSelected: "3",
          isMusicaSelected: "4",
          isEventoSelected: "5",
          isTeatroSelected: "6",
          isOtrosSelected: "7",
          isSinCategoriaSelected: "8"
        };
      
        for (let key in categoryMap) {
          if (this.formOrigen[key]) {
            return categoryMap[key];
          }
        }
      
        return null; // ninguno está en true
      }
      
      
}

