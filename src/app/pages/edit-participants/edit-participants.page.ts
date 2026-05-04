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
import { UsersFollowModalPage } from '../users-follow-modal/users-follow-modal.page';

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-edit-participants',
  templateUrl: './edit-participants.page.html',
  styleUrls: ['./edit-participants.page.scss'],
})
export class EditParticipantsPage implements OnInit {


  isAndroid: boolean = false;
  isIOS: boolean = false;

  @ViewChild('mySlider') slider: IonSlides;

  public actu:any=true;

  public allowed:boolean=false;
  public newProject:any=null;

  slideOptions = {
    direction: 'horizontal',
    slidesPerView: 'auto',
  };


  public participantsSelectedIds:any=[];
  public participantsSelected:any=[];
  public participants:any=[];
  public participantsIds: any = [];
  public originalsParticipantsIds: any = [];
  public form: FormGroup;
  public form2: FormGroup;

  public searchText='';

  public projectId:any=null;
  public creator:any=null;

  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------

  isChargeLoading:boolean=false;

  constructor(
    private platform: Platform,
   // this.navController.navigateForward("/add-participants", {state: {newProject:result['newProject']}});
   private translate: TranslateService,
   private modalCtrl: ModalController,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    //private camera: Camera,
    public auth: AuthenticationService,
    public navController:NavController,
    private router: Router,//SEGUIMIENTO DE TIEMPO
    
  ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

    this.form = new FormGroup({
      participantsIds: new FormControl(this.participantsIds),
      filter: new FormControl(''),
      
    });

    this.form2 = new FormGroup({
      participantsSelectedIds: new FormControl(this.participantsSelectedIds),
      theProject: new FormControl(0),
      
    });
  }

  ngOnInit() {
    
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

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción

    this.projectId=history.state.projectId; 
    console.log(this.projectId);

    this.creator=history.state.creator;
    console.log(this.creator);

    
    if(this.projectId!=null){

      this.apiService.obtainProjectParticipants({projectId:this.projectId}).subscribe((result) => {
        console.log('Result',result);

        if(result['state']=='ALLOWED'){
          
          this.participantsSelected=result['users'];
          console.log('TODOS: ',this.participantsSelected);
          // this.participants=result;
          console.log("ids SELECCIONADOS");
          console.log(this.participantsSelectedIds);
          this.participantsSelected.forEach(user => {
            // Guardar el ID de cada usuario en el array originalsParticipantsId
            this.originalsParticipantsIds.push(user.id);
          });
          this.allowed=true;
          
          // Ahora puedes ver el array originalesParticipantsId con los IDs de los usuarios
          console.log('listado:',this.originalsParticipantsIds);
          this.form2.get('theProject').setValue(this.projectId);
          this.obtainParticipantsOfChat/*obtainParticipantsOfFollowAndChat*/();
        }
        else if (result['state'] ==='DATE_ENDED'){
       
          this.utilities.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));
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
    
  }



  public obtainParticipantsOfChat/*obtainParticipantsOfFollowAndChat*/(){//getSimilarCourses
    this.participants =[];
    this.participantsIds = [];
    this.form.get('participantsIds').patchValue(this.participantsIds);
    
    this.apiService.obtainParticipantsOfChat/*obtainParticipantsOfFollowAndChat*/(this.form.value).subscribe((result) => {
      console.log('DATOS',result);
      this.participants=this.participants.concat(result['participants']);//concadenar listado vehiculos

      this.participantsIds=this.participantsIds.concat(result['participantsIds']);//añado nuevos ids
      this.form.get('participantsIds').patchValue(this.participantsIds);

    }, error => {
      
      this.translate.get('edit-participants.No se pudo obtener más usuarios').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
    });


    console.log('proyectos: ', this.participants);
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    

  }
  


  goBack() {
    if(!history.state.fromDetailProject){//COMPROBAR SI VIENE DE EDITAR PROYECTO O DE DETALLES DEL PROYECTO PARA QUE NO VAYA A edit-project Y ROMPA EL REDIRECCIONAMIENTO
      this.navController.navigateBack("/edit-project", {
        state: { projectId: this.projectId }
      });

    }
    else{
      this.navController.pop();
    }
    
  }

  

  async onSlideReachEnd() {
    if(this.actu==true){
      this.actu=false;
      console.log('FIN SLIDER');
      //this.getAllCourses();
    }
  }



  getMoreparticipants() {
    
  console.log('>>>>>>>>>>>>getMoreparticipants>>>>>>>>>>');
    this.apiService.obtainParticipantsOfChat/*obtainParticipantsOfFollowAndChat*/(this.form.value).subscribe((result) => {
      console.log('Result2',result);
      
      this.participants=this.participants.concat(result['participants']);//concadenar listado vehiculos
      this.participantsIds=this.participantsIds.concat(result['participantsIds']);//añado nuevos ids
      this.form.get('participantsIds').patchValue(this.participantsIds);
      //this.actu=true;
    }, error => {
      this.translate.get('edit-participants.No se pudo obtener más usuarios').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
      console.log(error);
      //this.actu=true;
      
    });
  }

  onIonInfinite(ev) {
    this.getMoreparticipants();
    console.log(ev);
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }




  selectParticipant(user) {

    const index = this.participantsSelected.findIndex(participant => participant.id === user.id);

    if (index === -1) {
      // Si no existe, lo añadimos
      this.participantsSelected.push(user);
      console.log('Usuario agregado:', user);
    } else {
      // Si ya existe, lo eliminamos
      this.participantsSelected.splice(index, 1);
      console.log('Usuario eliminado:', user);
    }

    console.log('Lista de participantes seleccionados:', this.participantsSelected);
   



/*
   
    const userExists = this.participantsSelected.find(participant => participant.id === user.id);
    
   
    if (!userExists) {
      this.participantsSelected.push(user);
      console.log('Usuario agregado:', user);
    } else {
      //this.utilities.showToast('El usuario seleccionado ya está añadido al listado de participantes');
      this.translate.get('edit-participants.El usuario seleccionado ya está añadido al listado de participantes').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });

    }
  
    console.log('Lista de participantes seleccionados:', this.participantsSelected);*/
  }


  removeUserSelected(user) {
    // Encuentra el índice del usuario en el array participantsSelected
    const index = this.participantsSelected.findIndex(participant => participant.id === user.id);
  
    // Si el usuario fue encontrado (índice no es -1), elimínalo del array
    if (index !== -1) {
      this.participantsSelected.splice(index, 1);
      console.log('Usuario eliminado:', user);
    } else {
      console.log('Usuario no encontrado:', user);
    }
  
    console.log('Lista de participantes seleccionados después de eliminar:', this.participantsSelected);
  }


  /*getUserLabels(user): string {
    return user?.allmycategories && user.allmycategories.length > 0
        ? user.allmycategories.map(label => label).join(', ')
        : 'Sin Categorías';
  }*/

        getUserLabels(user): string {
          if (user?.allmycategories && user.allmycategories.length > 0) {
            // Traducir todas las categorías del usuario
            let translatedCategories: string[] = [];
        
            user.allmycategories.forEach(category => {
              this.translate.get(category).subscribe((translatedCategory: string) => {
                translatedCategories.push(translatedCategory);
              });
            });
        
            // Unir las categorías traducidas
            return translatedCategories.join(', ');
        
          } else {
            // Traducir "Sin Categorías"
            let translatedText = '';
            this.translate.get('edit-participants.Sin Categorías').subscribe((translation: string) => {
              translatedText = translation;
            });
            return translatedText;
          }
        }
  

  isUserSelected(participant): boolean {
    return this.participantsSelected.some(p => p.id === participant.id);
  }


  onSearchChange($event) {
    console.log("cambio");
   
       this.form.get('filter').patchValue(this.searchText);
       this.obtainParticipantsOfChat/*obtainParticipantsOfFollowAndChat*/();
    // }
     
     
 
  }








  submit() {
    // Vaciar el array de IDs por si ya tiene datos
    this.participantsSelectedIds = [];
  
    // Recorrer participantsSelected y obtener las IDs
    this.participantsSelected.forEach(participant => {
      this.participantsSelectedIds.push(participant.id);
    });
  
    // Asignar las IDs al campo del formulario
    this.form2.get('participantsSelectedIds').setValue(this.participantsSelectedIds);
  
    // Comprobar si hay algún valor en participantsSelectedIds
   // if (this.participantsSelectedIds.length > 0) {
      // Aquí podrías proceder con la lógica para enviar el formulario
      console.log('Formulario listo para enviar', this.form2.value);
      //this.utilities.showLoading('');
      this.isChargeLoading=true;

      this.apiService.updateParticipants(this.form2.value).subscribe((result) => {
        console.log('DATOS',result);
        if(result['state']=="USERS ASSOCIATED"){
          this.isChargeLoading=false;

          //this.utilities.dismissLoading();
         // this.utilities.showToast('Usuarios asociados al proyecto');
          this.translate.get('edit-participants.Usuarios asociados al proyecto').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
          //this.navController.navigateForward("/grant-permissions", {state: {newProject:this.newProject}});
          //this.navController.navigateRoot("/edit-project", {state: {projectId:this.projectId}});
          this.goBack();
        }
        else if(result['state']=="NOT EXIST"){
          //this.utilities.dismissLoading();
          this.isChargeLoading=false;

          this.translate.get('edit-participants.El proyecto indicado ya no existe').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });

          this.navController.navigateRoot("/tabs/workspace");

        }
        else if(result['state']=="SUB_NOT_ALLOWED"){
          this.isChargeLoading=false;

          //this.utilities.dismissLoading();
          this.abrirModalInvitado();

        }
        else if (result['state'] ==='DATE_ENDED'){
          this.isChargeLoading=false;

        //  this.utilities.dismissLoading();
          this.utilities.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));
        }
        
      }, error => {
        this.isChargeLoading=false;

        //this.utilities.dismissLoading();
        this.translate.get('edit-participants.No se puedieron asignar los participantes').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        console.log(error);
      });
    
    
   /* } else {
      // Mostrar un mensaje de error si no se ha seleccionado ningún participante
      //console.error('Debe añadir al menos un participante antes de enviar.');
      //this.utilities.showToast('Debe añadir al menos un participante antes de enviar.');
      
      this.navController.navigateRoot("/edit-project", {state: {projectId:this.projectId}});

    }*/
  }




  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");

    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2=state.isActive;
      if(this.isActive2){
        const currentRoute = this.router.url;
        if(currentRoute.includes('/edit-participants')){
          console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
          //this.startInterval();
        }
      }
      else{
        //this.clearInterval();

      }
      
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Verifica si la ruta actual no es '/UserSearch'
        if (!event.url.includes('/edit-participants')) {
          //console.log('Saliendo de edit-participants, limpiando intervalos');
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

    if(this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
      console.log("Suscripción al router cancelada correctamente");
    }

    if (this.interval) {

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:32,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`edit-participants: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:32,screenTime:this.countSeg}).subscribe((result) => {
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
      console.log(`edit-participants: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    } 
    else {
      console.log('edit-participants: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
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
        this.goBack();
       }

    
      });
    return await modal.present();
  }





  async abrirModalFollow(){
  
  
      //recojo listado de ids de usuarios participantes de listado
     // let userIds = this.participantsSelected.map(user => user.id);
      //console.log(userIds);
  
  
        const modal = await this.modalCtrl.create({
          component: UsersFollowModalPage,
          cssClass: '',
          componentProps: {
           /* district: this.charge.mesaControl.district,*/
           modifyAllowed:this.allowed,
           projectId:this.projectId,
           userIds:this.originalsParticipantsIds,
            
            
          },
         // backdropDismiss:false
        });
    
        modal.onDidDismiss().then((data) => {
         // const selectedNetwork = data.data?.selectedNetwork;
         console.log(data);
         let newParticipantsList = (data.data.newParticipants); 
         if(newParticipantsList.length>0){



          this.apiService.obtainProjectParticipants({projectId:this.projectId}).subscribe((result) => {
            console.log('Result',result);
    
            if(result['state']=='ALLOWED'){
              
              this.participantsSelected=result['users'];
              console.log('TODOS: ',this.participantsSelected);
              // this.participants=result;
              console.log("ids SELECCIONADOS");
              console.log(this.participantsSelectedIds);
              this.participantsSelected.forEach(user => {
                // Guardar el ID de cada usuario en el array originalsParticipantsId
                this.originalsParticipantsIds.push(user.id);
              });
              this.allowed=true;
              
              // Ahora puedes ver el array originalesParticipantsId con los IDs de los usuarios
              console.log('listado:',this.originalsParticipantsIds);
              this.form2.get('theProject').setValue(this.projectId);
              this.obtainParticipantsOfChat/*obtainParticipantsOfFollowAndChat*/();
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
  
          
          
          
    
        
        
    
    
    
        });
    
    
        return await modal.present();
      }
  

}

