import { Component, NgZone, OnInit } from '@angular/core';
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


@Component({
  selector: 'app-add-participants-to-group',
  templateUrl: './add-participants-to-group.page.html',
  styleUrls: ['./add-participants-to-group.page.scss'],
})
export class AddParticipantsToGroupPage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;

  @ViewChild('mySlider') slider: IonSlides;

  public actu:any=true;


  public allowed:boolean=false;
 
  public me:any=null;

  slideOptions = {
    direction: 'horizontal',
    slidesPerView: 'auto',
  };


  public participantsSelectedIds:any=[];
  public participantsSelected:any=[];
  public participants:any=[];
  public participantsIds: any = [];
  public form: FormGroup;
  public form2: FormGroup;

  public searchText='';

  isChargeLoading:boolean=false;


  constructor(
    private platform: Platform,
   // this.navController.navigateForward("/add-participants", {state: {newProject:result['newProject']}});

   private navCtrl: NavController,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    //private camera: Camera,
    public auth: AuthenticationService,
    public navController:NavController,
    private translate: TranslateService,
    private modalCtrl: ModalController,
    private ngZone : NgZone,
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
      groupName: new FormControl(''),
      language_code: new FormControl('en'),
    });
  }

  ngOnInit() {
    this.actu=true;
    

   
    this.form2.get('theProject').setValue(history.state.projectId);
    console.log(this.translate.langs.length);
  
    if (this.translate.langs.length == 0) {
      console.log("No idioma");
  
      this.utilities.saveLang('en');
    }
    else{
      const currentLang = this.translate.currentLang;
      console.log("Idioma actual:", currentLang);
      this.form2.patchValue({ language_code: currentLang });
      //this.language_code=currentLang;
    }
    this.obtainAllProjectParticipants();


    
  }

  ionViewDidEnter() {

    
  }


  onSearchChange($event) {
    console.log("cambio");
   
      // this.form.get('filter').patchValue(this.searchText);
      // this.obtainParticipants();
    // }
     
     
 
  }


  obtainAllProjectParticipants(){

    this.apiService.obtainAllProjectParticipants({projectId:history.state.projectId,filter:null,pendingParticipants:false}).subscribe((result) => {
      console.log('Result',result);
      

      if(result['state']=='ALLOWED'){
        this.allowed=true;
        this.participants=result['participants'];
        this.me=result['me'];
        console.log(this.me);
      }
      else if(result['state']=='DATE_ENDED'){
        this.utilities.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));
      }
      else{
        //this.abrirModalInvitado();//sinpopus
        this.navCtrl.navigateForward('/my-suscription', { state: { fromInvalidSub:true} });

      }

      
     
      
    }, error => {
      
      this.translate.get('add-participants-to-group.No se obtuvieron los participantes').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });

      console.log(error);
      //this.actu=true;
      
    });
  }
  



  

  async onSlideReachEnd() {
    if(this.actu==true){
      this.actu=false;
      console.log('FIN SLIDER');
      //this.getAllCourses();
    }
    
    
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
      this.utilities.showToast(this.translate.instant('add-participants-to-group.El usuario seleccionado ya está añadido al listado de participantes'));

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
      this.translate.get('add-participants-to-group.Sin Categorías').subscribe((translation: string) => {
        translatedText = translation;
      });
      return translatedText;
    }
  }
  

  isUserSelected(participant): boolean {
    return this.participantsSelected.some(p => p.id === participant.id);
  }


  


  submit() {

    this.ngZone.run(() => {
      console.log("ENTRO EN EL LOADING");
      
      this.isChargeLoading=true;

      console.log("FUERA DEL LOADING");
      
    });
    


   /* if((this.searchText.trim()).length <= 0){
      
     
      this.translate.get('add-participants-to-group.Introduzca un nombre para el grupo de chat').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });

    }
    
    else{*/

    

    // Vaciar el array de IDs por si ya tiene datos
    this.participantsSelectedIds = [];
  
    // Recorrer participantsSelected y obtener las IDs
    this.participantsSelected.forEach(participant => {
      this.participantsSelectedIds.push(participant.id);
    });
  
    // Asignar las IDs al campo del formulario
    this.form2.get('participantsSelectedIds').setValue(this.participantsSelectedIds);
    this.form2.get('groupName').setValue(this.searchText);
  
    // Comprobar si hay algún valor en participantsSelectedIds
    //if (this.participantsSelectedIds.length > 0) {
      // Aquí podrías proceder con la lógica para enviar el formulario
      console.log('Formulario listo para enviar', this.form2.value);

      //this.utilities.showLoading('');
      // this.isChargeLoading=true;

      this.apiService.createChatGroup(this.form2.value).subscribe((result) => {
        console.log('DATOS',result);
        if(result['state']=="GROUP_CREATED"){
          this.isChargeLoading=false;

         // this.utilities.dismissLoading();
          this.translate.get('add-participants-to-group.¡Grupo de chat creado!').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
        
            
            this.navCtrl.pop();
          

        }
        else if(result['state']=="DATE_ENDED"){
          //this.utilities.dismissLoading();
          this.isChargeLoading=false;

          this.utilities.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));

        }
        else if(result['state']=="NOTALLOWED"){
         // this.utilities.dismissLoading();
          this.isChargeLoading=false;

          this.abrirModalInvitado();
        }
        else{
          //this.utilities.dismissLoading();
          this.isChargeLoading=false;

          this.translate.get('add-participants-to-group.No se pudo crear el grupo').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });


        }
        
      }, error => {
       // this.utilities.dismissLoading();
        this.isChargeLoading=false;

        this.translate.get('add-participants-to-group.No se pudo crear el grupo').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        console.log(error);
      });
    
    
    //} 
    /*else {
      // Mostrar un mensaje de error si no se ha seleccionado ningún participante
    //  console.error('Debe añadir al menos un participante antes de enviar.');
     
      this.translate.get('add-participants-to-group.Debe añadir al menos un miembro al grupo de chat').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText); 
      });
    }*/
   // }
  }
  

  goBack(){

    this.navCtrl.pop();
  }


  async abrirModalInvitado(){


    let titleText=this.translate.instant('add-participants-to-group.Sin Suscripción válida');
    let infoText=this.translate.instant('add-participants-to-group.Hazte con el plan 360 para crear y administrar proyectos');

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

}
