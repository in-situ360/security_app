import { Component, OnInit } from '@angular/core';
import {ModalController, NavController,Platform, NavParams } from '@ionic/angular';
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
  selector: 'app-users-follow-modal',
  templateUrl: './users-follow-modal.page.html',
  styleUrls: ['./users-follow-modal.page.scss'],
})
export class UsersFollowModalPage implements OnInit {

  
  /*
  if(this.projectId!=null){

      this.apiService.obtainProjectParticipants({projectId:this.projectId}).subscribe((result) => {
        console.log('Result',result);

        if(result['state']=='ALLOWED'){
          this.allowed=true;
          this.participantsSelected=result['users'];
          // this.participants=result;
          console.log("ids SELECCIONADOS");
          console.log(this.participantsSelectedIds);
          this.form2.get('theProject').setValue(this.projectId);
          this.obtainParticipants();
        }
        else{

          this.abrirModalInvitado();
        }
      
        
      }, error => {
        
        this.translate.get('edit-participants.No se obtuvieron los paticipantes').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        console.log(error);
        //this.actu=true;
        
      });
    }
  */







      isAndroid: boolean = false;
      isIOS: boolean = false;
    
      @ViewChild('mySlider') slider: IonSlides;
    
      public actu:any=true;

      public modifyAllowed:any=false;
      public userIdsFromNavParams: any[] = [];
    
    
      public userFollowsSelected:any=[];
      public follows:any=[];
      public followsIds: any = [];
      public form: FormGroup;
      public form2: FormGroup;
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
        private navParams: NavParams,
        private modalController: ModalController
      ) {
    
        this.isIOS=this.platform.is('ios');
        this.isAndroid=this.platform.is('android');
    
        this.form = new FormGroup({
          followsIds: new FormControl(this.followsIds),
          language_code: new FormControl('en'),
          
        });

        this.form2 = new FormGroup({
          participantsSelectedIds: new FormControl(this.userFollowsSelected),
          theProject: new FormControl(0),
          language_code: new FormControl('en'),
        });

       /* modifyAllowed:history.state.modifyAllowed,
         projectId:this.projectId*/

         
    
       }
    
      ngOnInit() {
        this.actu=true;

        if(this.navParams.get('modifyAllowed')!=null){
          this.modifyAllowed = this.navParams.get('modifyAllowed');
          console.log('modal edit alowed: ',this.modifyAllowed);
          console.log('Usuarios ids: ',this.navParams.get('userIds'));
        }


        if (this.modifyAllowed && this.navParams.get('userIds') && this.navParams.get('userIds').length > 0) {
          this.userIdsFromNavParams = this.navParams.get('userIds');
        }
        
        
       
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
        this.form2.get('language_code').patchValue(language);
        this.obtainUserFollowsFilteredByChat();
      }

      // Método para comprobar si un ID está en el listado de 'userIdsFromNavParams'
      isUserHighlighted(userId: number): boolean {

        if(this.userIdsFromNavParams.includes(userId)|| this.userFollowsSelected.includes(userId)){
          return true;
        }
        else{
          return false;
        }
        //return this.userIdsFromNavParams.includes(userId);
      }
    
    
    
    
      public obtainUserFollowsFilteredByChat(){//
        this.follows =[];
        this.followsIds = [];
        this.form.get('followsIds').patchValue(this.followsIds);
        
        this.apiService.obtainUserFollowsFilteredByChat(this.form.value).subscribe((result) => {
          console.log('Modal DATOS:',result);
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
          this.apiService.obtainUserFollowsFilteredByChat(this.form.value).subscribe((result) => {
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
    
       
    
    
    
    
      
          
    
    
      
    
    
    
    
      
    
    
    
    
    
        getCategoryCounter(){
          this.apiService.getCategoryCounter({}).subscribe((result)=>{
            console.log(result);
            
           
      
            if(result['userSub']!=null && result['userSub']!=1 && result['userSub']!=4){
             
              this.access_user_allow=true;
            }
            else{

              if(result['project_credits']){
                this.access_user_allow=true;
              }
              else{
                this.access_user_allow=false;
              }
              
              
            }
      
      
            if(result['userSub']!=null && (result['userSub']==3 || result['userSub']==6)){
              this.access_allow=true;
            }
            else{

              if(result['project_credits']){
                this.access_allow=true;
              }
             else{
              this.access_allow=false;
             }

              
            }
      
      
            
            
           
          }, error => {
            
            this.translate.get('buscador2.No se pudo obtener el contador de categorías').subscribe((translatedText: string) => {
              this.utilities.showToast(translatedText); 
            });
                console.log(error);
              });
        
      
        }
    
    
        goBack(){
    
          //cierro modal
        }
    
    
        
    
        selectFollow(followSelected: any) {

          if(this.modifyAllowed==true){
            // Verificar si el ID del usuario ya está en el array userFollowsSelected
            const userId = followSelected.id;
          
            if (!this.userFollowsSelected.includes(userId) && !this.userIdsFromNavParams.includes(userId)) {
              // Si el ID no está en el array, lo añadimos
              this.userFollowsSelected.push(userId);
          
              // Añadir el ID también al array userIdsFromNavParams
              //this.userIdsFromNavParams.push(userId);
            } else {
              // Si el ID ya está, lo eliminamos
              this.userFollowsSelected = this.userFollowsSelected.filter(id => id !== userId);
              //this.userIdsFromNavParams = this.userIdsFromNavParams.filter(id => id !== userId);
            }
          
            console.log('User Follows Selected:', this.userFollowsSelected);
            console.log('User IDs from Nav Params:', this.userIdsFromNavParams);
          }
        }


        async dismissModal() {
          await this.modalController.dismiss({
            newParticipants: [],
          });
        }




        submit() {
          
        
          // Asignar las IDs al campo del formulario
          this.form2.get('participantsSelectedIds').setValue(this.userFollowsSelected);
          
          this.form2.get('theProject').setValue(this.navParams.get('projectId'));
        
          // Comprobar si hay algún valor en participantsSelectedIds
          if (this.userFollowsSelected.length > 0) {
            // Aquí podrías proceder con la lógica para enviar el formulario
            console.log('Formulario listo para enviar', this.form2.value);
            this.utilities.showLoading('');
            this.apiService.addParticipantsOfFollows(this.form2.value).subscribe((result) => {
              console.log('DATOS',result);
              if(result['state']=="USERS ASSOCIATED"){
                this.utilities.dismissLoading();
                this.translate.get('add-participants.Usuarios asociados al proyecto').subscribe((translatedText: string) => {
                  this.utilities.showToast(translatedText); 
                });
                
               
                //this.navController.navigateForward("/grant-permissions", {state: {newProject:this.newProject}});
               
                  this.modalController.dismiss({
                    newParticipants: result['newUsers'],
                  });
                
      
              }
              else if(result['state']=="SUB_NOT_ALLOWED"){
                this.utilities.dismissLoading();
                this.abrirModalInvitado();
      
              }
              else if (result['state'] ==='DATE_ENDED'){
                this.utilities.dismissLoading();
                this.utilities.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));
              }
              
              
            }, error => {
              this.utilities.dismissLoading();
              this.translate.get('add-participants.No se pudieron asignar los participantes').subscribe((translatedText: string) => {
                this.utilities.showToast(translatedText); 
              });
              console.log(error);
            });
          
          
          } 
        }
    

        async abrirModalInvitado(){


          let titleText=this.translate.instant('edit-participants.Sin Suscripción válida');
          let infoText=this.translate.instant('edit-participants.Hazte con el plan 360 para crear y administrar proyectos');
      
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
              this.dismissModal();
            }

        
          });
      

          return await modal.present();
        }

}
