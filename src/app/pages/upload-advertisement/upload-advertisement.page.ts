import { Component, OnInit } from '@angular/core';
import {ModalController, NavController,Platform } from '@ionic/angular';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ApiService } from 'src/app/services/api.service';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { ViewChild } from '@angular/core';
import { IonSelect } from '@ionic/angular';
import { Camera, CameraResultType } from '@capacitor/camera';
import { AllImageCropperPage } from '../all-image-cropper/all-image-cropper.page';

declare var google; //GOOGLEPLACE

@Component({
  selector: 'app-upload-advertisement',
  templateUrl: './upload-advertisement.page.html',
  styleUrls: ['./upload-advertisement.page.scss'],
})
export class UploadAdvertisementPage implements OnInit {

  @ViewChild('selectRef', { static: false }) selectRef: IonSelect;


  public form: FormGroup;
  isAndroid: boolean = false;
  isIOS: boolean = false;
  public rutaImagen:string="assets/imgs/imgNewAdd2.png";
  
  public categoryIds:any=[];
  public show:boolean=false;
  public disabledRange:boolean=false;


  public timePrice: number = 0;
  public clickPrice: number = 0;


  chips = [
    { id:1 ,label: 'Fotografía',showLabel:'', selected: false },
    { id:2 ,label: 'Cine/Video', showLabel:'',selected: false },
    { id:3,label: 'TV',showLabel:'', selected: false },
    { id:4,label: 'Música',showLabel:'', selected: false },
    { id:5,label: 'Eventos',showLabel:'', selected: false },
    { id:6,label: 'Teatro',showLabel:'', selected: false },
    { id:7,label: 'Otros', showLabel:'',selected: false },
    { id:8,label: 'Sin categoría',showLabel:'', selected: false }
  ];

  public rangeAgeMinMax:any={ lower: 18, upper: 40 };

  public base64img: string;
  public avatar:any=null;

  constructor (private modalController: ModalController,private modalCtrl: ModalController,private translate: TranslateService,private platform: Platform,private utilities: UtilitiesService,private navCtrl: NavController,private apiService: ApiService) {
    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

    this.form = new FormGroup({
      avatar: new FormControl(''),
      //userId: new FormControl('', [Validators.required]),
      featured: new FormControl(false , [Validators.required]),
      //min_age: new FormControl(18 , [Validators.required]),
      //max_age: new FormControl(40 , [Validators.required]),
      rangeAgeValues:new FormControl({ lower: 18, upper: 40 }),
      categoryIds:new FormControl(this.categoryIds),
      location: new FormControl('',[Validators.required]),
      lat: new FormControl('', [Validators.required]),
      lng: new FormControl('', [Validators.required]),
      price: new FormControl(0),
      kms: new FormControl(2),
      days:new FormControl(18),
      byClick:new FormControl(true),
      impressions:new FormControl(18),
      gender: new FormControl('',[Validators.required]),

    });







   

    /*
    this.form = new FormGroup({
        avatar: new FormControl(''),
        role_id: new FormControl(''),
        name: new FormControl('', { validators: [Validators.required, Validators.minLength(3)] }),
        surname1: new FormControl(''),
        gender: new FormControl(''),
        surname2: new FormControl(''),
        hide_my_user: new FormControl(false),
        representativeName: new FormControl(''),
        price: new FormControl(100),
        proffesion: new FormControl(''),
        birthdate: new FormControl('', { validators:[Validators.required, this.pastDateValidator()] }),
        description: new FormControl(''),
        tagInputValue:new FormControl(''),
        //deleteTagIds: new FormControl(this.deleteTagIds),
        tags: new FormControl(this.tags),
        pronInputValue: new FormControl(''),
        prons: new FormControl(this.prons),
        categoryIds:new FormControl(this.categoryIds),
        
        language_code:new FormControl('en'),
      });
    */

   }

  ngOnInit() {


    

    this.utilities.getLang().then(async (result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo==null) {
        console.log("No idioma");
        this.utilities.saveLang('en');
       // const toastMensaje = await this.translate.get("finish-profile.Nombre").toPromise();
        //this.placeholderName = toastMensaje + '*';
  
        
      } else {
        
        this.switchLanguage(prefijo || 'en');
      }
    });



    this.chips.forEach(chip => {
      chip.showLabel = this.translate.instant(chip.label);
    });
    console.log("ionViewWillEnter()");
    this.show=true;


    this.initAutocomplete();


    this.apiService.getEntity('advertisement_parameters', 1).subscribe(res => {
      console.log(res);
      const data = res.result;

      this.timePrice = parseFloat(data.time_price);
      this.clickPrice = parseFloat(data.click_price);

      this.utilities.showToast(`click: ${this.clickPrice}, day: ${this.timePrice}`);

      this.form.get('price')?.setValue(this.getTotalPrice());
     
    }, error => {
      console.log(error);
    
    })

    this.form.get('byClick')?.valueChanges.subscribe((checked: boolean) => {
      if (!checked) {
        this.form.get('impressions')?.setValue(0);
        this.disabledRange = true;
      } else {
        this.form.get('impressions')?.setValue(18);
        this.disabledRange = false;
      }
    });
    this.disabledRange = !this.form.get('byClick')?.value;
  }

  goBack(){
    this.navCtrl.pop()
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.form.patchValue({ language_code: language });

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
      const lastChipIdIndex = this.categoryIds.indexOf(this.chips[this.chips.length - 1].id);
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
      this.form.get('location').patchValue(input.value); 
     


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
      this.form.get('actual').patchValue(''); 

    } 
  }


  onIonChangeKms(event: any) {
    console.log('Nuevo rango kms seleccionado:', event.detail.value);
    console.log(this.form.get('kms').value);
   //this.form.get('kms')?.setValue(this.);

   this.form.get('price')?.setValue(this.getTotalPrice());
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

  }

  onIonChange(event: any) {
    console.log('Nuevo rango seleccionado (min):', event.detail.value.lower);
    console.log('Nuevo rango seleccionado (max):', event.detail.value.upper);
    console.log('-----------------------------------------');
  

   

   if(event.detail.value.lower > event.detail.value.upper) {
    this.rangeAgeMinMax={ lower: event.detail.value.upper, upper: event.detail.value.upper };
   } 
   else { 
    this.rangeAgeMinMax=event.detail.value;
  }

  console.log(this.form.get('rangeAgeValues').value);


  
  //this.form.get('rangePriceValues')?.setValue(this.rangePriceMinMax);
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

  }



  isToggleChecked(){
    if(!(this.form.get('byClick')?.value === true)){
      this.form.get('impressions')?.setValue(0);
      this.disabledRange=false;
    }
    else{
      this.disabledRange=true;
    }
  }



  onDaysChange(event: any): void {
    this.form.get('price')?.setValue(this.getTotalPrice());
  }

  onImpressionsChange(event: any): void {
    this.form.get('price')?.setValue(this.getTotalPrice());
  }



  getTotalPrice(): number {
    const days = this.form.get('days')?.value || 0;
    const impressions = this.form.get('impressions')?.value || 0;
  
    const total = (this.timePrice * days) + (this.clickPrice * impressions);
    return parseFloat(total.toFixed(2)); // Redondear a 2 decimales
  }





  submitForm(){
    console.log("Se activo");
    console.log(this.form.value);
   this.apiService.addEntity('advertisements', this.form.value).subscribe(() => {
      
    }, (error) => {
      console.error('Error al procesar el pago:', error);
      this.utilities.dismissLoading();
      this.utilities.showToast(this.translate.instant('error'));
    });
  }





  onSelectChange(event: any) {
    const selectedValue = event.detail.value;
    console.log('seleccionada:', selectedValue);
    if(selectedValue==1){
      this.adjuntarImagen();
    }
    else{

    }
 
  }

  // Método para manejar el evento de cancelación del ion-select
  onSelectCancel() {
    console.log('Selección cancelada');
   
  }


  obtainImageVideo(){
    this.selectRef.open();
  }




  public async adjuntarImagen() {


    
    
        
    const permissions = await Camera.requestPermissions();

    if (permissions.photos === 'denied' || permissions.camera === 'denied') {
      console.log('permiso camera ', permissions);
    }

    const image = await Camera.getPhoto({
      promptLabelHeader: 'Fotos',
      promptLabelCancel: 'Cancelar',
      promptLabelPhoto: 'Galería',
      promptLabelPicture: 'Cámara',
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64
    });
    console.log(image);
    this.base64img = 'data:image/jpeg;base64,' + image.base64String;
    console.log('imagen ', this.base64img);


      const base64String = image.base64String || ''; // Asegurar que la cadena exista
      const length = base64String.length; // Longitud de la cadena Base64
      const padding = (base64String.match(/=/g) || []).length; // Contar los '=' al final

      // Tamaño en bytes según la fórmula
      const tamañoEnBytes = (length * 3) / 4 - padding;
      const tamañoEnKB = (tamañoEnBytes / 1024).toFixed(2); // Tamaño en kilobytes

      console.log(`El tamaño de la imagen es: ${tamañoEnBytes} bytes (${tamañoEnKB} KB)`);




    this.form.patchValue({ avatar: this.base64img });
    this.avatar = this.base64img;
    

    this.openAllImageCropper(true);

}



async openAllImageCropper($newImage:boolean) {

    console.log(">>>>>>>>>>>>");
    const imageRuta=this.base64img;
    const newImage=$newImage;
    console.log(">>>>>>>>>>>>");
    const modal = await this.modalController.create({
      component: AllImageCropperPage,
      componentProps: { imageRuta, newImage }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        console.log('Cropped Image:', result.data);

        if(result.data.croppedImageFile!=null ){
          this.base64img=result.data.croppedImageFile;


          console.log("dios que funcione>>>>>>>>>>>>");

          console.log(this.base64img);
          //this.rutaImagen =this.base64img;

          this.form.patchValue({ avatar: this.base64img });
          this.avatar = this.base64img;
          
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




}
