import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { AlertController, IonSelect, IonSlides, ModalController, NavController,Platform } from '@ionic/angular';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { ModalFiltTextPage } from '../modal-filt-text/modal-filt-text.page';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import {  ViewChild } from '@angular/core';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.page.html',
  styleUrls: ['./workspace.page.scss'],
})
export class WorkspacePage implements OnInit {

  isAndroid: boolean = false;
  isIOS: boolean = false;
  isInvited: boolean = false;

  public allowObtainProject:boolean=true;

  showSelect = false;
 

  public form: FormGroup;

  public projects:any=[];
  public projectsIds: any = [];

  public projectSelected:any=null;
  public filtText:any="";

  public opc:any=0;


  public theUserId=-1;

  @ViewChild('hiddenSelect') hiddenSelect: IonSelect;
  


  //SEGUIMIENTO DE TIEMPO
  private interval: any=null;;
  private countSeg:number;
  private previousDate: Date | null = null;
  private isActive2:boolean=true;
  private routerSubscription: Subscription;
  //-----------------------------------------


  private keyboardListener: any;
  isChargeLoading:boolean=false;


  constructor(private alertCtrl: AlertController,private translate: TranslateService,private utilitiesService: UtilitiesService,private platform: Platform,private apiService: ApiService,private modalCtrl: ModalController,private navCtrl:NavController, private router: Router,//SEGUIMIENTO DE TIEMPO
    ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');

    this.form = new FormGroup({
      projectsIds: new FormControl(this.projectsIds),
      state: new FormControl(1),
      filtName: new FormControl(''),
      language_code: new FormControl('en'),
    });

  }

  ngOnInit() {

    this.utilitiesService.getUserId().then((result) => {
      this.theUserId = result;
    });

    if(this.apiService.getUserId()==3){
      this.isInvited=true;
      this.abrirModalInvitado();
    }
    else{

      this.apiService.projectsChanges.subscribe(() => {
        this.allowObtainProject=false;
        console.log('<--------(projectsChanges)---------->');
        this.obtainProjects();
       /* if(this.opc==0){
          this.obtainProjectsAddedToUser();
        }
        else{
          this.obtainUserCreateProjects();
        }*/
        
        
      });

      
    }
  }

  ionViewDidEnter() {
    console.log(this.translate.langs.length);

    this.utilitiesService.getUserId().then((result) => {
      this.theUserId = result;
    });
  
    this.utilitiesService.getLang().then((result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo==null) {
        console.log("No idioma");
        this.utilitiesService.saveLang('en');
  
        
      } else {
        
        this.switchLanguage(prefijo || 'en');
      }
      if(this.allowObtainProject){
        this.obtainProjects();
      }
    });
    

   /* if(this.opc==0){
      this.obtainProjectsAddedToUser();
    }
    else{
      this.obtainUserCreateProjects();
    }*/
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.form.patchValue({ language_code: language });
  }

  


  async abrirModalInvitado(){
    const modal = await this.modalCtrl.create({
      component: InvitadoModalPage,
      cssClass: 'InvitadoMensajeModal',
      componentProps: {
       /* district: this.charge.mesaControl.district,*/
        
        
      },
     // backdropDismiss:false
    });
    return await modal.present();
  }




  selectOPC($opc){
    this.opc=$opc;

    if(this.opc==0){
      this.obtainProjectsAddedToUser();
    }
    else{
      this.obtainUserCreateProjects();
    }
  }











  public obtainProjectsAddedToUser(){//getSimilarCourses
    this.projects =[];
    this.projectsIds = [];
    this.form.get('projectsIds').patchValue(this.projectsIds);
    this.form.get('filtName').patchValue(this.filtText);
   // this.utilitiesService.showLoading('');
    //filtName
    this.apiService.obtainProjectsAddedToUser(this.form.value).subscribe((result) => {
      console.log('DATOS',result);
      this.projects=this.projects.concat(result['projects']);//concadenar listado vehiculos

      this.projectsIds=this.projectsIds.concat(result['projectsIds']);//añado nuevos ids
      this.form.get('projectsIds').patchValue(this.projectsIds);
      //this.utilitiesService.dismissLoading();
      this.isChargeLoading=false;

    }, error => {
      
      this.translate.get('workspace.No se pudo obtener las colaboraciones de proyecto').subscribe((translatedText: string) => {
        this.utilitiesService.showToast(translatedText); 
      });
      //this.utilitiesService.dismissLoading();
      this.isChargeLoading=false;
      console.log(error);
    });


    console.log('proyectos: ', this.projects);
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    

  }

  public obtainUserCreateProjects(){//getSimilarCourses
    this.projects =[];
    this.projectsIds = [];
    this.form.get('projectsIds').patchValue(this.projectsIds);
    this.form.get('filtName').patchValue(this.filtText);
    
   // this.utilitiesService.showLoading('');
    this.apiService.obtainUserCreateProjects(this.form.value).subscribe((result) => {
      
      console.log('DATOS',result);
      this.projects=this.projects.concat(result['projects']);//concadenar listado vehiculos

      this.projectsIds=this.projectsIds.concat(result['projectsIds']);//añado nuevos ids
      this.form.get('projectsIds').patchValue(this.projectsIds);
      //this.utilitiesService.dismissLoading();
      this.isChargeLoading=false;

    }, error => {
      this.translate.get('workspace.No se pudo obtener el listado de proyectos').subscribe((translatedText: string) => {
        this.utilitiesService.showToast(translatedText); 
      });
      //this.utilitiesService.dismissLoading();
      this.isChargeLoading=false;
      console.log(error);
    });


    console.log('proyectos: ', this.projects);
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    

  }
  


/*
  onSelectChange(event: any) {
    console.log(event.detail.value);
    this.form.get('state').patchValue(event.detail.value);

    if(this.opc==0){
      this.obtainProjectsAddedToUser();
    }
    else{
      this.obtainUserCreateProjects();
    }

    
  }*/





  getMoreProjects() {

    //this.utilitiesService.showLoading('');
    this.isChargeLoading=true;
      console.log('>>>>>>>>>>>>getMoreProjects>>>>>>>>>>');
        this.apiService.obtainProjects(this.form.value).subscribe((result) => {
          console.log('Result2',result);
          
          this.projects=this.projects.concat(result['projects']);//concadenar listado vehiculos
          this.projectsIds=this.projectsIds.concat(result['projectsIds']);//añado nuevos ids
          this.form.get('projectsIds').patchValue(this.projectsIds);
          //this.utilitiesService.dismissLoading();
          this.isChargeLoading=false;
          setTimeout(() => {
       //this.utilitiesService.dismissLoading();

       this.isChargeLoading=false;
      }, 1000);
          
          //this.actu=true;
        }, error => {
          this.translate.get('workspace.No se pudo obtener las colaboraciones de proyecto').subscribe((translatedText: string) => {
            this.utilitiesService.showToast(translatedText); 
          });
          console.log(error);
         // this.utilitiesService.dismissLoading();
          this.isChargeLoading=false;
          //this.actu=true;
          
        });
    /*if(this.opc==0){
      this.utilitiesService.showLoading('');
      console.log('>>>>>>>>>>>>getMoreProjects>>>>>>>>>>');
        this.apiService.obtainProjectsAddedToUser(this.form.value).subscribe((result) => {
          console.log('Result2',result);
          
          this.projects=this.projects.concat(result['projects']);//concadenar listado vehiculos
          this.projectsIds=this.projectsIds.concat(result['projectsIds']);//añado nuevos ids
          this.form.get('projectsIds').patchValue(this.projectsIds);
          this.utilitiesService.dismissLoading();
          //this.actu=true;
        }, error => {
          this.translate.get('workspace.No se pudo obtener las colaboraciones de proyecto').subscribe((translatedText: string) => {
            this.utilitiesService.showToast(translatedText); 
          });
          console.log(error);
          this.utilitiesService.dismissLoading();
          //this.actu=true;
          
        });
    }
    else{
      this.utilitiesService.showLoading('');
      this.apiService.obtainUserCreateProjects(this.form.value).subscribe((result) => {
      console.log('DATOS',result);
      this.projects=this.projects.concat(result['projects']);//concadenar listado vehiculos

      this.projectsIds=this.projectsIds.concat(result['projectsIds']);//añado nuevos ids
      this.form.get('projectsIds').patchValue(this.projectsIds);
      this.utilitiesService.dismissLoading();


    }, error => {
      this.translate.get('workspace.No se pudo obtener el listado de proyectos').subscribe((translatedText: string) => {
        this.utilitiesService.showToast(translatedText); 
      });
      console.log(error);
      this.utilitiesService.dismissLoading();

    });

    }*/
  }

  onIonInfinite(ev) {
    if(this.allowObtainProject){
      this.getMoreProjects();
      console.log(ev);
      setTimeout(() => {
        (ev as InfiniteScrollCustomEvent).target.complete();
      }, 500);
    }
  }

  getVerifiedUsersCount(project: any): number {
    return project?.verifiedUsers?.length || 0;
  }

 

  formatEndDate0(date: Date | string): string {
    return formatDate(date, 'dd MMMM yyyy', 'es-ES'); //
  }

  formatEndDate(date: Date | string): string {
    const langCode = this.form.value.language_code || 'en';
    return formatDate(date, 'dd MMMM yyyy', `${langCode}-${langCode.toUpperCase()}`);
  }









  selectProject($project){
    this.projectSelected=$project;
    console.log(this.projectSelected);
    console.log('userId:',this.theUserId);
    console.log();
    if(this.opc==0){
        if (this.projectSelected.verifiedUsers.length > 0) {
          console.log('El proyecto tiene usuarios verificados:', this.projectSelected.verifiedUsers);

          const userFound = this.projectSelected.verifiedUsers.some(user => user.id === this.theUserId/*this.apiService.getUserId()*/);

          if(userFound) {
            console.log(`El proyecto tiene el usuario con ID ${this.theUserId} en la lista de usuarios verificados.`);
            this.navCtrl.navigateForward("/detail-proyect", {state: {projectSelected:this.projectSelected.id}});
          } 
          else if(this.projectSelected?.user_creator_id==this.theUserId){
            console.log("Creador del proyecto");
            this.navCtrl.navigateForward("/detail-proyect", {state: {projectSelected:this.projectSelected.id}});
          }
          else {
            console.log(`El proyecto no tiene el usuario con ID ${this.theUserId} en la lista de usuarios verificados.`);
            
              this.addMeToProject();
            
            
          }


        } else {
          console.log('El proyecto no tiene usuarios verificados.');
          if(this.projectSelected?.user_creator_id==this.theUserId){
            console.log("Creador del proyecto");
            this.navCtrl.navigateForward("/detail-proyect", {state: {projectSelected:this.projectSelected.id}});
          }
          else{
            this.addMeToProject();
          }
        }
      }
      else{

        //redireccionar a pagina de carpetas del proyecto
        //this.navCtrl.navigateForward("/folders", {state: {projectSelected:this.projectSelected}});
        this.navCtrl.navigateForward("/detail-proyect", {state: {projectSelected:this.projectSelected.id}});
        

      }
  }

  addMeToProject(){

    this.navCtrl.navigateForward("/add-proyect", {state: {projectSelected:this.projectSelected}});

  }


 /* async goFiltModal(){

    
      const modal = await this.modalCtrl.create({
        component: ModalFiltTextPage,
        cssClass: 'filtModal',
        componentProps: {
          filtText: this.filtText,
          
          
        },
      });


      modal.onDidDismiss().then((data) => {
        console.log('Rango dismis devuelto:', data);
       // const selectedNetwork = data.data?.selectedNetwork;
       
       this.filtText = data.data.filtText; 
       
       //this.form.get('filtText').patchValue(this.filtText);
       if(this.opc==0){
          this.obtainProjectsAddedToUser();
        }
        else{
          this.obtainUserCreateProjects();
        }
  
  
      });
  

      return await modal.present();
    
  }*/















  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");



    this.keyboardListener = Keyboard.addListener('keyboardDidHide', () => { 
      console.log('HOLA CHATS');
      if (this.router.url.includes('tabs/workspace')) {
        console.log('El teclado se ha cerrado del workspace>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        // Aquí puedes ejecutar acciones cuando el teclado se cierre
        if(this.allowObtainProject){
          this.obtainProjects();
        }
        
      }
    }); 

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

        console.log('>>>>>>>>>>>>>');
        console.log(event.url);
        console.log('>>>>>>>>>>>>>');
        if (!event.url.includes('/workspace')) {
         // console.log('Saliendo de workspace, limpiando intervalos');
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
    if (this.keyboardListener) {
      this.keyboardListener.remove();
      console.log('Listener de teclado eliminado ✅');
      //this.keyboardListener=null;
    }
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
      this.apiService.registerTimeScreen({screenId:5,screenTime:this.countSeg}).subscribe((result) => {
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
      //: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      //console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({screenId:5,screenTime:this.countSeg}).subscribe((result) => {
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
      //console.log(`workspace: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      //console.log(this.countSeg);


    } 
    else {
     // console.log('workspace: No hay fecha anterior, usando la actual como inicial.');
    }

    
    this.previousDate = currentDate;
  }
  








  onSearchChange($event) {}

  onSearchClear() {
    console.log("Se pulsó la X, limpiando búsqueda.");
    this.filtText = ''; // Limpia la variable vinculada
    if(this.allowObtainProject){
      this.obtainProjects();
    }
  }

  onSearchInput(event: any) {
      const input = event.target as HTMLInputElement;
      if (input) {
        const cursorPosition = input.selectionStart; // Guardar la posición del cursor
        input.value = this.formatText(input.value); // Formatear texto
        /* input.setSelectionRange(cursorPosition, cursorPosition); */// Restaurar la posición del cursor
        console.log('onSearchInput:', input.value);
        this.filtText =input.value;
        if(this.allowObtainProject){
          this.obtainProjects();
        }
      }
      
    }
    
    private formatText(value: string): string {
      // Convertir texto a mayúsculas después de un espacio
      return value.replace(/(?:^| )\w/g, (match) => match.toUpperCase());
    }


    onEnterPress(event: KeyboardEvent) {
      
      //console.log(this.filtText);
      //this.form.get('filtName').patchValue(this.filtText);
      // Verificar si la tecla presionada es Enter
      if (event.key === 'Enter') {
        console.log("Se pulsó Enter");
        Keyboard.hide();  // Cierra el teclado en dispositivos móviles
        console.log("///");
      }
      
      
      
    }


    goFiltModal() {
      this.showSelect = true; // O puedes usar: this.showSelect = !this.showSelect; para alternar
    }
  
    // Se ejecuta cuando cambia la selección del select
   




// Este método se dispara al hacer click en el icono de filtros
openHiddenSelect() {
  this.hiddenSelect.open();
}

// Detecta el cambio de selección en el ion-select
onSelectChange(event: any) {
  const selectedValue = event.detail.value;
  //console.log('Valor seleccionado:', selectedValue);
  this.form.get('state').patchValue(event.detail.value);
  if(this.allowObtainProject){
    this.obtainProjects();
  }
}


obtainProjects(){
 // this.utilitiesService.showLoading('');--------------------
  this.projects =[];
  this.projectsIds = [];
  this.form.get('projectsIds').patchValue(this.projectsIds);
  this.form.get('filtName').patchValue(this.filtText);
  console.log('Formulario-datos:',this.form.value);

 this.apiService.obtainProjects(this.form.value).subscribe((result) => {
    console.log('Result obtainProjects:',result);
    this.projects=this.projects.concat(result['projects']);//concadenar listado vehiculos
    this.projectsIds=this.projectsIds.concat(result['projectsIds']);//añado nuevos ids
    this.form.get('projectsIds').patchValue(this.projectsIds);
    
    setTimeout(() => {
      // this.utilitiesService.dismissLoading();
       this.isChargeLoading=false;
      }, 500);
    this.allowObtainProject=true;
  }, error => {
    console.log(error);
    //this.utilitiesService.dismissLoading(); 
    this.isChargeLoading=false;
    this.allowObtainProject=true;
  });
}



  public obtainUserSub(){
    this.apiService.obtainUserSub().subscribe(async (sub:any)=>{
      console.log('Sub actual:',sub);
      
      if(sub==3 || sub==6){
        this.navCtrl.navigateForward("/new-project");

      }
      else{

        let titleText=this.translate.instant('add-proyect.Sin Suscripción');
        let infoText=this.translate.instant('add-proyect.Adquiera una suscripción para poder aceptar y rechazar proyectos');

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
        return await modal.present();

      }
      
    }, error => {
      console.log(error);
    });
  }










  onProjectFullSwipeOpen(project: any) {
  // Swipe completo desde la izquierda ⇒ abrir
  this.selectProject(project);
}

onProjectFullSwipeDelete(project: any) {
  // Swipe completo desde la derecha ⇒ eliminar
  //this.deleteProject(project);
  //this.projects = this.projects.filter(p => p.id !== project.id);
  //this.utilitiesService.showToast("Proyecto eliminado con éxito");
  this.deleteProject(project);
}

async deleteProject(project: any) {
  const alert = await this.alertCtrl.create({
    header: this.translate.instant('Eliminar proyecto'),
    message: this.translate.instant('¿Desea eliminar el proyecto?'),
    buttons: [
      { text: this.translate.instant('Cancelar'), role: 'cancel' },
      {
        text: this.translate.instant('Aceptar'),
        handler: () => {
          // 1) Borra visualmente manteniendo tu diseño
         

          






          this.apiService.deleteProject({id:project.id}).subscribe((result) => {
                if (result['state'] ==='NOT_FOUND'){
                   this.projects = this.projects.filter(p => p.id !== project.id);
                  this.translate.get('edit-project.Proyecto indicado ya no existe').subscribe((translatedText: string) => {
                    this.utilitiesService.showToast(translatedText); 
                  });
               
                }
                if (result['state'] ==='NOT_ALLOWED'){
                  this.translate.get('edit-project.Solo el creador del proyecto puede borrarlo').subscribe((translatedText: string) => {
                    this.utilitiesService.showToast(translatedText); 
                  });
                  
                }
                if (result['state'] ==='SUB_NOT_ALLOWED'){
                  this.abrirModalInvitado();
                }
                else if (result['state'] ==='DATE_ENDED'){
                 
                  this.utilitiesService.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));
                }
                else if (result['state'] === 'DELETED') {
                  console.log("entro dentro");
                  this.projects = this.projects.filter(p => p.id !== project.id);
                 
                  this.translate.get('edit-project.Proyecto eliminado').subscribe((translatedText: string) => {
                    this.utilitiesService.showToast(translatedText); 
                  });
                  
                  
                  //this.navController.navigateForward("/add-participants", { state: { newProject: result['newProject'] } });
                } else {
                  console.log("respuesta inesperada");
                  console.log(result['state']);
                  console.log("--------------------");
                }
          
              }, (error) => {
                //this.utilitiesService.showToast(this.translate.instant(codeErrors(error)));
              });















        }
      }
    ]
  });

  await alert.present();
}


}