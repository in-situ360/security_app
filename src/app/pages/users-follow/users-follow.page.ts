import { Component, OnInit } from '@angular/core';
import {ModalController, NavController,Platform } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users-follow',
  templateUrl: './users-follow.page.html',
  styleUrls: ['./users-follow.page.scss'],
})
export class UsersFollowPage implements OnInit {



  isAndroid: boolean = false;
  isIOS: boolean = false;

  @ViewChild('mySlider') slider: IonSlides;

  public actu:any=true;


  public follows:any=[];
  public followsIds: any = [];
  public form: FormGroup;
  public access_user_allow:boolean=false;
  public access_allow:boolean=false;
  

  rating: any = 0;

  stars: Array<number> = [0, 1, 2, 3, 4];

  constructor(
    private platform: Platform,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    //private camera: Camera,
    public auth: AuthenticationService,
    public navController:NavController,
    private translate: TranslateService,
    private router: Router,
    private modalCtrl: ModalController,
  ) {

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

    this.form = new FormGroup({
      followsIds: new FormControl(this.followsIds),
      language_code: new FormControl('en'),
      
    });

   }

  ngOnInit() {
    this.actu=true;
    //this.obtainUserFollows();
    this.getCategoryCounter();
  }


  public ionViewWillEnter(){

  //  console.log(this.translate.langs.length);
    
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



  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.form.get('language_code').patchValue(language);
    this.obtainUserFollows();
  }




  public obtainUserFollows(){//getSimilarCourses
    this.follows =[];
    this.followsIds = [];
    this.form.get('followsIds').patchValue(this.followsIds);
    
    this.apiService.obtainUserFollows(this.form.value).subscribe((result) => {
      console.log('DATOS',result);
      this.follows=this.follows.concat(result['follows']);//concadenar listado vehiculos

      this.followsIds=this.followsIds.concat(result['followsIds']);//añado nuevos ids
      this.form.get('followsIds').patchValue(this.followsIds);

    }, error => {
     
      this.translate.get('users-follow.No se pudo obtener más usuarios').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });


    console.log('proyectos: ', this.follows);
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    

  }



  getMoreUserFollows() {
    
    console.log('>>>>>>>>>>>>getMore>>>>>>>>>>');
      this.apiService.obtainUserFollows(this.form.value).subscribe((result) => {
        console.log('Result2',result);
        
        this.follows=this.follows.concat(result['follows']);//concadenar listado vehiculos
        this.followsIds=this.followsIds.concat(result['followsIds']);//añado nuevos ids
        this.form.get('followsIds').patchValue(this.followsIds);
        //this.actu=true;
      }, error => {
        this.translate.get('users-follow.No se pudo obtener más usuarios').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        console.log(error);
        //this.actu=true;
        
      });
    }
  
    onIonInfinite(ev) {
      this.getMoreUserFollows();
      console.log(ev);
      setTimeout(() => {
        (ev as InfiniteScrollCustomEvent).target.complete();
      }, 500);
    }


    




    //LISTADO DE USUSARIOS
  //----------------------------------------------------------------------


  selectEmp($usuario){

    if(!this.access_user_allow){
      this.abrirModalInvitado();
    }
    else{

      console.log($usuario);
      
      
      //this.navCtrl.navigateForward("/buscador2", {state: {/*category:null,*/searchText:this.searchText,userSelected:this.userSelected}});
      this.navController.navigateForward("/other-user", {state: {userId:$usuario.id}});
      
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





  getUserLabels(user): string {
    // Primero verifica si existe translateUserLabels y contiene elementos
    return user?.translateUserLabels && user.translateUserLabels.length > 0
      ? user.translateUserLabels.map(label => label.value).join(', ')
      : user?.allmylabels && user.allmylabels.length > 0
        ? user.allmylabels.map(label => label.value).join(', ')
        : this.translate.instant('buscador2.Sin tags'); // Traduce 'Sin tags' si no hay etiquetas
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




  async abrirModalInvitado(){
  
  
      let titleText=this.translate.instant('buscador2.Sin Suscripción válida');
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
        this.navController.back();
       }

    
      });

      return await modal.present();
    }





    getCategoryCounter(){
      this.apiService.getCategoryCounter({}).subscribe((result)=>{
        console.log(result);
        
       
  
        if(result['userSub']!=null && result['userSub']!=1 && result['userSub']!=4){
         
          this.access_user_allow=true;
        }
        else{
          
          this.access_user_allow=false;
        }
  
  
        if(result['userSub']!=null && (result['userSub']==3 || result['userSub']==6)){
          this.access_allow=true;
        }
        else{
          this.access_allow=false;
        }
  
  
        
        
       
      }, error => {
        
        this.translate.get('buscador2.No se pudo obtener el contador de categorías').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
            console.log(error);
          });
    
  
    }


    goBack(){

      this.navController.back();
      //this.navController.pop();
    }


    goBuscador2(){

      this.form = new FormGroup({
        // brand: new FormControl(''),
         mostValued:new FormControl(false),
         bestValued:new FormControl(false),
         expensiveFirst: new FormControl(false),
         cheapFirst: new FormControl(false),
         name:new FormControl(''),
         categoryId:new FormControl(-1),
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
         categoryIds: new FormControl([]),
         tags: new FormControl([]),
         tagInputValue:new FormControl(''),
         //vehicleIds: new FormControl(this.vehicleIds),
         
      });

      this.navController.navigateForward("/buscador2", {state: {form: this.form.value/*,searchText:this.searchText,userSelected:this.userSelected*/}});
    }
}
