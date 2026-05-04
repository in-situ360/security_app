import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl  } from '@angular/forms';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE


import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { ModalFiltTextPage } from '../modal-filt-text/modal-filt-text.page';



import { IonSelect } from '@ionic/angular';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.page.html',
  styleUrls: ['./languages.page.scss'],
})



export class LanguagesPage implements OnInit {
  @ViewChild('languageSelect', { static: false }) languageSelect: IonSelect; // Referencia al ion-select

  isAndroid: boolean = false;
  isIOS: boolean = false;

  public showSelect: boolean = false;

  public otherslangs:any=[];
  public newOthers:any=[];
 
  public form: FormGroup;
  public language_code:string='en';


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
    private utilities: UtilitiesService,
    private navCtrl: NavController,
    private apiService: ApiService,
    private api: ApiService,
    private translate: TranslateService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
    private platform: Platform,private modalCtrl: ModalController,
    ) {
      this.isIOS=this.platform.is('ios');
      this.isAndroid=this.platform.is('android'); 
  
      this.form = new FormGroup({
        others: new FormControl(),
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

        this.obtainAllUserLanguajes();
      }


      goBack(){
        this.navCtrl.pop()
      }
    
      public obtainAllUserLanguajes(){
    
        this.otherslangs =[];
        this.newOthers=[];
       
        //this.utilities.showLoading('');
        this.isChargeLoading=true;
        this.apiService.obtainAllUserLanguajes({language_code:this.language_code}).subscribe((result) => {
          console.log('DATOS',result);
          //this.utilities.dismissLoading();
          this.isChargeLoading=false;
    
    
          this.otherslangs=result['othersLangs'];
          this.newOthers=[];
          this.otherslangs.forEach((languaje: any) => {
            this.newOthers.push(languaje);
          });
          
       
    
        }, async error => {
          //this.utilities.dismissLoading();
          this.isChargeLoading=false;
          this.utilities.showToast(await this.translate.get("languages.No se pudo obtener los idiomas").toPromise()); 

          

          console.log(error);
        });
    
      }
    
    
    
      /*addLocation() {
        this.otherslangs.push(''); // Añadir un elemento vacío al array
        this.newOthers.push('');
      }*/
        addLocation() {
          this.showSelect = true; // Mostrar el ion-select
      
          setTimeout(() => {
            if (this.languageSelect) {
              this.languageSelect.open(); // Abre el select automáticamente
            }
          }, 100); // Espera un pequeño tiempo para asegurar que se renderizó
        }

        /*removeLanguage(index: number) {
          console.log("LLEGOOO");
          this.otherslangs.splice(index, 1);
          this.newOthers.splice(index, 1);
        }*/

        removeLanguage(event: Event, index: number) {
          event.stopPropagation(); // Evita que el evento sea bloqueado por ion-item
          this.otherslangs.splice(index, 1);
          this.newOthers.splice(index, 1);
        }



        async languageSelected(event: any) {


          if (event.detail.value === 'otherModal') {
            this.showSelect = false; 
            await this.goOtherLangModal(); 
            return;
          }



          if (event.detail.value) {
            if(!this.otherslangs.includes(event.detail.value)){
              this.otherslangs.push(event.detail.value);
              this.newOthers.push(event.detail.value);
            }
            else{
              this.utilities.showToast(await this.translate.get("El idioma ya se encuentra en el listado").toPromise()); 
            }
          }


          

          this.showSelect = false; // Ocultar el select después de seleccionar
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
      getLanguajes() {
    
        
        this.form.get('others').patchValue(this.newOthers);
    
    
      
        console.log(this.newOthers);
    
        console.log(this.form.value);
    
       // this.utilities.showLoading('');
        this.isChargeLoading=true;
        this.apiService.updateLanguajes(this.form.value).subscribe((result) => {
          //this.utilities.dismissLoading();
          this.isChargeLoading=false;
          this.apiService.userChanges2.next();
          this.apiService.laguageChanges.next();
          this.navCtrl.navigateRoot("/tabs/my-profile");
         
    
        }, async error => {
          //this.utilities.dismissLoading();
          this.isChargeLoading=false;
          this.utilities.showToast(await this.translate.get("languages.No se pudo obtener los idiomas").toPromise()); 

          
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
            if(currentRoute.includes('/languages')){
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
            if (!event.url.includes('/languages')) {
             // console.log('Saliendo de languages, limpiando intervalos');
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
          this.apiService.registerTimeScreen({screenId:19,screenTime:this.countSeg}).subscribe((result) => {
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
          console.log(`languages: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
          console.log(this.countSeg);
    
          //ENVIO TIEMPO
          this.apiService.registerTimeScreen({screenId:19,screenTime:this.countSeg}).subscribe((result) => {
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
          console.log(`languages: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
          console.log(this.countSeg);
    
    
        } 
        else {
          console.log('languages: No hay fecha anterior, usando la actual como inicial.');
        }
    
        
        this.previousDate = currentDate;
      }
    




    async goOtherLangModal(){

    
      const modal = await this.modalCtrl.create({
        component: ModalFiltTextPage,
        cssClass: 'filtModal',
        componentProps: {
          filtText: '',
          
          
        },
      });


      modal.onDidDismiss().then(async (data) => {
        console.log('valor dismis devuelto:', data);
       // const selectedNetwork = data.data?.selectedNetwork;
       
      const inputValue = data.data?.filtText?.trim(); // Elimina espacios

      if (!inputValue) {
        // Si está vacío o sólo tiene espacios, no hacer nada
        return;
      }
      if(!this.otherslangs.includes(data.data.filtText)){
          this.otherslangs.push(data.data.filtText);
          this.newOthers.push(data.data.filtText);
      }
      else{
        this.utilities.showToast(await this.translate.get("El idioma ya se encuentra en el listado").toPromise()); 
      }
       
       
  
  
      });
  

      return await modal.present();
    
  }
}
