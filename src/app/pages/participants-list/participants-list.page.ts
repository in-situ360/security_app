import { Component, OnInit } from '@angular/core';
import {ModalController, NavController,Platform, AlertController } from '@ionic/angular';
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
  selector: 'app-participants-list',
  templateUrl: './participants-list.page.html',
  styleUrls: ['./participants-list.page.scss'],
})
export class ParticipantsListPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;
  public actu:any=true;
  public newProject:any=null;
  public participantsSelectedIds:any=[];
  public participantsSelected:any=[];
  public fromDetailProject:boolean=false;
  public modifyAllowed:boolean=false;

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

  constructor(private platform: Platform,
    // this.navController.navigateForward("/add-participants", {state: {newProject:result['newProject']}});
    private translate: TranslateService,
    private modalCtrl: ModalController,
    private alertController: AlertController,
     private apiService: ApiService,
     private utilities: UtilitiesService,
     //private camera: Camera,
     public auth: AuthenticationService,
     public navController:NavController,
     private router: Router,//SEGUIMIENTO DE TIEMPO
     ) { 

      this.isIOS=this.platform.is('ios');
      this.isAndroid=this.platform.is('android');

    }

    ngOnInit() {
    }


  ionViewDidEnter() {

    console.log('participants-list, argumentos recibidos:',{projectId:history.state.projectId,modifyAllowed:history.state.modifyAllowed,creator:history.state.creator,fromDetailProject:history.state.fromDetailProject});
    console.log(this.translate.langs.length);

    if(history.state.modifyAllowed){
      this.modifyAllowed=history.state.modifyAllowed
    }
  
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

   if( history.state.fromDetailProject){
    this.fromDetailProject=history.state.fromDetailProject;
   }
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    
    if(history.state.projectId){//para que al ir hacia atras de otra pagina no se sobreecriba por undefined
      this.projectId=history.state.projectId; 
    }
    if(history.state.creator){
      this.creator=history.state.creator;
    }
    
    if(this.projectId!=null){
    console.log('se ejecutara obtainAllProjectParticipants');
      this.apiService.obtainAllProjectParticipants({projectId:this.projectId, filter:this.searchText,pendingParticipants:this.modifyAllowed}).subscribe((result) => {
        console.log('Result',result);
        this.participantsSelected=result['participants'];

        const me = result['me']; 
        const pendingParticipants = result['pendingParticipants']; 

        // Añadir 'me' al final del listado de participantes

        if(me!=null){
          this.participantsSelected.push(me);
        }

         // Añadir  al final del listado los participantes pendientes de aceptar
        if(pendingParticipants!=null && pendingParticipants.length>0){
          this.participantsSelected = [...this.participantsSelected, ...pendingParticipants];

        }

        console.log('LISTADO FINAL: ',this.participantsSelected);

       
          

      }, error => {
        
        this.translate.get('edit-participants.No se obtuvieron los paticipantes').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        console.log(error);
        //this.actu=true;
        
      });
    }
    
  }

  selectEmp($usuario){

    if($usuario.id == this.participantsSelected[this.participantsSelected.length -1].id){
      return;
    }

      this.navController.navigateForward("/other-user", {state: {userId:$usuario.id}});
    
  }



  removeUserSelected(user) {
    console.log("PARTICIPANTS LIST: ", this.participantsSelected);
    console.log("USER : ", user);

    console.log("LENGHT : ", (this.participantsSelected.length -1));
    
    
    
    const exists = this.participantsSelected.some(
      (p) => p.id === user.id
    );

    if (!exists) {
      console.log('El usuario o no está en la lista');
      return;
    }
   
    if (this.creator.id==user.id) {
      console.log('El usuario es el creador (no se le debe de borrar)');
      return;
    }

    // Mostrar alert de confirmación antes de eliminar
    this.alertController.create({
      header: this.translate.instant('participants-list.confirmRemoveUserTitle') || 'Confirmación',
      message: this.translate.instant('participants-list.confirmRemoveUser') || `¿Está seguro de que desea eliminar a ${user.name}?`,
      buttons: [
        {
          text: this.translate.instant('participants-list.cancel') || 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: this.translate.instant('participants-list.remove') || 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.performRemoveUser(user);
          }
        }
      ]
    }).then(alert => alert.present());
  }

  performRemoveUser(user) {
    // Encuentra el índice del usuario en el array participantsSelected
    const index = this.participantsSelected.findIndex(participant => participant.id === user.id);
    
  
    // Si el usuario fue encontrado (índice no es -1), elimínalo del array
    if (index !== -1) {
      this.participantsSelected.splice(index, 1);

      this.participantsSelectedIds = [];
  
    // Recorrer participantsSelected y obtener las IDs
    this.participantsSelected.forEach(participant => {
      if(participant.id != this.participantsSelected[this.participantsSelected.length -1].id){
        this.participantsSelectedIds.push(participant.id);
      }
    });
      this.apiService.updateParticipants({theProject : this.projectId, participantsSelectedIds : this.participantsSelectedIds}).subscribe((result) => {
        console.log('DATOS',result);
        this.translate.get('participants-list.userRemoved').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText || 'Usuario eliminado');
        });
      }, error => {
        console.log(error);
        this.translate.get('participants-list.errorRemovingUser').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText || 'Error al eliminar usuario');
        });
      });
  
      console.log('Usuario eliminado:', user);
    } else {
      console.log('Usuario no encontrado:', user);
    }
  
    console.log('Lista de participantes seleccionados después de eliminar:', this.participantsSelected);
  }


  goBack() {
    this.navController.pop();
    /*this.navController.navigateBack("/edit-project", {
      state: { projectId: this.projectId }
    });*/
  }


  onSearchClear() {
    console.log("Se pulsó la X, limpiando búsqueda.");
    this.searchText = ''; // Limpia la variable vinculada
    
  }


  onSearchChange($event) {
    console.log("cambio");
   
       //this.form.get('filter').patchValue(this.searchText);
       this.apiService.obtainAllProjectParticipants({projectId:this.projectId, filter:this.searchText,pendingParticipants:this.modifyAllowed}).subscribe((result) => {
        console.log('Result',result);
        this.participantsSelected=result['participants'];
        const me = result['me']; 
        const pendingParticipants = result['pendingParticipants']; 

        // Añadir 'me' al final del listado de participantes

        if(me!=null){
          this.participantsSelected.push(me);
        }

        if(pendingParticipants!=null && pendingParticipants.length>0){
          this.participantsSelected = [...this.participantsSelected, ...pendingParticipants];

        }

        console.log('LISTADO FINAL: ',this.participantsSelected);

       
          

      }, error => {
        
        this.translate.get('edit-participants.No se obtuvieron los paticipantes').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        console.log(error);
        //this.actu=true;
        
      });
    
     
     
 
  }



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
      this.translate.get('add-participants-to-group.Sin Categorías').subscribe((translation: string) => {
        translatedText = translation;
      });
      return translatedText;
    }
  }









  async abrirModalFollow(){


    //recojo listado de ids de usuarios participantes de listado
    let userIds = this.participantsSelected.map(user => user.id);
    console.log(userIds);


      const modal = await this.modalCtrl.create({
        component: UsersFollowModalPage,
        cssClass: '',
        componentProps: {
         /* district: this.charge.mesaControl.district,*/
         modifyAllowed:this.modifyAllowed,
         projectId:this.projectId,
         userIds:userIds,
          
          
        },
       // backdropDismiss:false
      });
  
      modal.onDidDismiss().then((data) => {
       // const selectedNetwork = data.data?.selectedNetwork;
       console.log(data);
       let newParticipantsList = (data.data.newParticipants); 
       console.log('Listado usuarios nuevos devuelto:', newParticipantsList);

       this.participantsSelected = [...this.participantsSelected, ...newParticipantsList];

        
        
        
  
      
      
  
  
  
      });
  
  
      return await modal.present();
    }



    goParticipantsPages(){
      this.navController.navigateForward("/edit-participants", {state: {projectId:this.projectId, creator:this.creator/*.id*/,fromDetailProject:true}});
  }

}
