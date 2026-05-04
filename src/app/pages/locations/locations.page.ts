import { Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl  } from '@angular/forms';
import { NavController, Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

declare var google; //GOOGLEPLACE


@Component({
  selector: 'app-locations',
  templateUrl: './locations.page.html',
  styleUrls: ['./locations.page.scss'],
})
export class LocationsPage implements OnInit {

  //result['vehiculos']

  isAndroid: boolean = false;
  isIOS: boolean = false;
  public othersloc:any=[];
  public newOthers:any=[];
  public actual:any='';
  public form: FormGroup;
  public language_code:string='en'; 
  public originalActual: string = '';
  public originalLat:any='';
  public originalLng:any='';
  public selectedPlace: boolean = false;

   //SEGUIMIENTO DE TIEMPO
   private interval: any=null;;
   private countSeg:number;
   private previousDate: Date | null = null;
   private isActive2:boolean=true;
   private routerSubscription: Subscription;
   //-----------------------------------------
   isChargeLoading:boolean=false;

  constructor(
    private ngZone:NgZone,
    private translate: TranslateService,
    private utilities: UtilitiesService,
    private navCtrl: NavController,
    private apiService: ApiService,
    private api: ApiService,
    private platform: Platform,
    private router: Router,//SEGUIMIENTO DE TIEMPO
  ) {
      this.isIOS=this.platform.is('ios');
      this.isAndroid=this.platform.is('android'); 
  
      this.form = new FormGroup({
        

        actual: new FormControl(),
        others: new FormControl(),
        lat: new FormControl('', [Validators.required]),
        lng: new FormControl('', [Validators.required]),
        language_code: new FormControl('en'),
        
      })

    }


  ngOnInit() {
    
  }

  ionViewDidEnter() {
    console.log(this.translate.langs.length);
  
    if (this.translate.langs.length == 0) {
      console.log("No idioma");
  
      this.utilities.saveLang('en');
    }
    else{
      const currentLang = this.translate.currentLang;
      console.log("Idioma actual:", currentLang);
      this.form.patchValue({ language_code: currentLang });
      this.language_code=currentLang;
    }

    this.obtainAllUserLocations();

    
  }
/*
  ngAfterViewInit() {
    this.initializeAutocompleteForOthers();
  }*/

    goBack(){
      this.navCtrl.pop()
    }



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
  }

/*
  initAutocompleteOther(idInput: string, index: number) { 
    const input = document.getElementById(idInput) as HTMLInputElement;
    const autocomplete = new google.maps.places.Autocomplete(input);
  
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const address = input.value;

      
  
      console.log('Dirección seleccionada:', address);
      // Actualiza el valor de la dirección en el array
      this.ngZone.run(() => {
        this.newOthers[index] = address; // Actualiza el array con el valor seleccionado
      });
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


  onInputOtherLocation(event: Event, index: number) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value.trim();
  
    // Si el campo está vacío, actualizamos el array con un valor vacío
    if (!value) {
      console.log(`El campo en la posición ${index} está vacío.`);
      this.newOthers[index] = ''; // Actualiza el valor del array a vacío
    } 
  }


  initAutocompleteOther(idInput: string, index: number) {
    const input = document.getElementById(idInput) as HTMLInputElement;
    const autocomplete = new google.maps.places.Autocomplete(input);
  
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const address = input.value.trim();
  
      // Solo actualizamos el array si el campo no está vacío
      if (!address) {
        console.log(`El campo en la posición ${index} quedó vacío después de autocompletar.`);
        this.newOthers[index] = '';
        return;
      }
  
      console.log('Dirección seleccionada:', address);
      this.ngZone.run(() => {
        this.newOthers[index] = address; // Actualiza el array con la dirección seleccionada
      });
    });
  }
  





  initializeAutocompleteForOthers() {
    setTimeout(() => {
      this.othersloc.forEach((_, index) => {
        const idInput = `otherLocation-${index}`;
        this.initAutocompleteOther(idInput, index);
      });
    }, 0); // Espera a que los elementos estén en el DOM
  }
  


  public obtainAllUserLocations(){

    this.othersloc =[];
    this.newOthers=[];
    this.actual='';
    
   // this.utilities.showLoading('');
    this.apiService.obtainAllUserLocations({language_code:this.language_code}).subscribe((result) => {
      console.log('DATOS',result);

     // this.utilities.dismissLoading();
      this.othersloc=result['othersLocs'];
      this.newOthers=[];
      this.othersloc.forEach((location: any) => {
        this.newOthers.push(location);
      });
      this.actual=result['actualLoc'];
      this.originalActual = result['actualLoc'];
      this.originalLat=result['actualLat']+'';
      this.originalLng=result['actualLng']+'';
      this.form.get('actual').patchValue(result['actualLoc']); 
      this.form.get('lat').patchValue(result['actualLat']);
      this.form.get('lng').patchValue(result['actualLng']);
      
      
   
      this.initAutocomplete();
      this.initializeAutocompleteForOthers();


    }, async error => {
     //this.utilities.dismissLoading();
     // this.utilities.showToast('Hubo un problema al obtener los ');
      this.utilities.showToast(await this.translate.get("locations.No se pudo obtener las ubicaciones").toPromise()); 

      console.log(error);
    });

  }



  addLocation() {
    this.othersloc.push(''); // Añadir un elemento vacío al array
    this.newOthers.push('');
    setTimeout(() => {
      const newIndex = this.othersloc.length - 1;
      const idInput = `otherLocation-${newIndex}`;
      this.initAutocompleteOther(idInput, newIndex);
    }, 0); // Delay para esperar que el elemento esté en el DOM
  }

  // Actualizar la ubicación en el índice especificado
  updateLocation(index: number, value: any) {
    console.log(value)
    // Actualiza el valor en el array others
    //this.newOthers[index] = value;
    this.ngZone.runOutsideAngular(()=>this.actu(index, value));
    
  }

  actu(index: number, value: any){

    this.newOthers[index] = value.detail.value;

  }




    

  // Método para obtener todas las ubicaciones
  updateLocations() {

   // this.form.get('actual').patchValue(this.actual);
    this.form.get('others').patchValue(this.newOthers);


    console.log(this.actual);
    console.log(this.newOthers);



    if(!this.selectedPlace) {
    console.log("No se seleccionó una dirección válida, restaurando valor original.");
    this.form.get('actual').patchValue(this.originalActual);
    this.form.get('lat').patchValue(this.originalLat+'');
    this.form.get('lng').patchValue(this.originalLng+'');
  }

    console.log(this.form.value);


    //this.utilities.showLoading('');
    this.isChargeLoading=true;
    this.apiService.updateLocations(this.form.value).subscribe((result) => {
     // this.utilities.dismissLoading();
      this.isChargeLoading=false;
      this.apiService.userChanges2.next();
      this.navCtrl.navigateRoot("/tabs/my-profile");
     

    }, async error => {
      this.isChargeLoading=false;
      //this.utilities.dismissLoading();
      //this.utilities.showToast('Hubo un problema al obtener');
      this.utilities.showToast(await this.translate.get("locations.No se pudieron actualizar las ubicaciones").toPromise()); 

      
      console.log(error);
    });


   

   


  }



  




















  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
        const currentRoute = this.router.url;
        if(currentRoute.includes('/locations')){
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
        if (!event.url.includes('/locations')) {
          //console.log('Saliendo de locations, limpiando intervalos');
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
      this.apiService.registerTimeScreen({screenId:18,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`locations: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:18,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`locations: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('locations: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }


}
