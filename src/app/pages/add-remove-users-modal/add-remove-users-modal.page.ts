import { Component, OnInit } from '@angular/core';
import {ModalController, NavController,NavParams,Platform } from '@ionic/angular';
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
  selector: 'app-add-remove-users-modal',
  templateUrl: './add-remove-users-modal.page.html',
  styleUrls: ['./add-remove-users-modal.page.scss'],
})
export class AddRemoveUsersModalPage implements OnInit {

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
  public opc=0;

  public searchText='';

  public opcTitleParticipants='';
  public opcTitle='';

  isChargeLoading:boolean=false;


  constructor(
     private navParams: NavParams,
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
    
  ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

    

    this.form = new FormGroup({
      participantsIds: new FormControl(this.participantsIds),
      chatId: new FormControl(-1),
      opc: new FormControl(0),
      
    });

    this.form2 = new FormGroup({
      participantsSelectedIds: new FormControl(this.participantsSelectedIds),
      chatId: new FormControl(-1),
      opc: new FormControl(0),
      
    });
  }

  ngOnInit() {
    


    
  }

  ionViewDidEnter() {

    this.actu=true;
    
    if(this.navParams.get('chatId')!=null){
      this.form2.get('chatId').setValue(this.navParams.get('chatId'));
      this.form.get('chatId').setValue(this.navParams.get('chatId'));
     
    }
    if(this.navParams.get('opc')!=null){

      if(this.navParams.get('opc')==1){
        this.opcTitle="add-remove-users-modal.METER USUARIOS EN GRUPO";
        this.opcTitleParticipants="add-remove-users-modal.Usuarios para meter";
      }
      else{
        this.opcTitle="add-remove-users-modal.SACAR USUARIOS DEL GRUPO";
        this.opcTitleParticipants="add-remove-users-modal.Usuarios para sacar";
      }

      this.form2.get('opc').setValue(this.navParams.get('opc'));
      this.form.get('opc').setValue(this.navParams.get('opc'));
     this.opc=this.navParams.get('opc');
    }

   
    
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
    this.obtainProjectParticipantToChats();
  }


  onSearchChange($event) {
    console.log("cambio");
   
      // this.form.get('filter').patchValue(this.searchText);
      // this.obtainParticipants();
    // }
     
     
 
  }


  obtainProjectParticipantToChats(){
   

    this.apiService.obtainProjectParticipantToChats({chatId:this.navParams.get('chatId'),opc:this.navParams.get('opc')}).subscribe((result) => {
      console.log('Result',result);
      

      if(result['state']=='ALLOWED'){
        this.allowed=true;
        this.participants=result['participants'];
        this.me=result['me'];
        console.log(this.me);
      }
      else{
        this.abrirModalInvitado();
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
    console.log(this.participantsSelectedIds.length);
   
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


  


  
  

  goBack(){

    this.dismiss();
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
        this.goBack();
      }

        
    });
    return await modal.present();
  }






  removeUsersOfChat(){

    this.participantsSelectedIds = [];
  
    // Recorrer participantsSelected y obtener las IDs
    this.participantsSelected.forEach(participant => {
      this.participantsSelectedIds.push(participant.id);
    });
  
    // Asignar las IDs al campo del formulario
    this.form2.get('participantsSelectedIds').setValue(this.participantsSelectedIds);


    console.log('Formulario listo para enviar', this.form2.value);

      //this.utilities.showLoading('');
      this.isChargeLoading=true;

      this.apiService.removeUsersOfChat(this.form2.value).subscribe((result) => {
        console.log('DATOS',result);
        if(result['state']=="REMOVED"){
         // this.utilities.dismissLoading();
          this.isChargeLoading=false;

          this.translate.get('add-remove-users-modal.Listado actualizado').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
        
          this.dismiss();
            //this.navCtrl.pop();
          

        }
        else if(result['state']=="NOTALLOWED"){
          //this.utilities.dismissLoading();
          this.isChargeLoading=false;

          this.abrirModalInvitado();
        }
        else{
          //this.utilities.dismissLoading();
          this.isChargeLoading=false;

          this.translate.get('add-remove-users-modal.No se pudo actualizar el listado').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });


        }
        
      }, error => {
        //this.utilities.dismissLoading();
        this.isChargeLoading=false;

        this.translate.get('add-participants-to-group.No se pudo crear el grupo').subscribe((translatedText: string) => {
          this.utilities.showToast(translatedText); 
        });
        console.log(error);
      });


  }


  addUsersToChat(){


    this.participantsSelectedIds = [];
  
    // Recorrer participantsSelected y obtener las IDs
    this.participantsSelected.forEach(participant => {
      this.participantsSelectedIds.push(participant.id);
    });
  
    // Asignar las IDs al campo del formulario
    this.form2.get('participantsSelectedIds').setValue(this.participantsSelectedIds);


    console.log('Formulario listo para enviar', this.form2.value);

      //this.utilities.showLoading('');
      this.isChargeLoading=true;

      this.apiService.addUsersToChat(this.form2.value).subscribe((result) => {
        console.log('DATOS',result);
        if(result['state']=="ADDED"){
          //this.utilities.dismissLoading();
          this.isChargeLoading=false;

          this.translate.get('add-remove-users-modal.Listado actualizado').subscribe((translatedText: string) => {
            this.utilities.showToast(translatedText); 
          });
        
            
            //this.navCtrl.pop();
            this.dismiss();
          

        }
        else if(result['state']=="NOTALLOWED"){
          //this.utilities.dismissLoading();
          this.isChargeLoading=false;

          this.abrirModalInvitado();
        }
        else{
          //this.utilities.dismissLoading();
          this.isChargeLoading=false;

          this.translate.get('add-remove-users-modal.No se pudo actualizar el listado').subscribe((translatedText: string) => {
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


  }


  dismiss() {

    this.modalCtrl.dismiss({
      'dismissed': true
    });

}
}
