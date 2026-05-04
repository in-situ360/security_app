import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, IonRouterOutlet, ModalController, NavController, Platform, AlertController } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE

import { App } from '@capacitor/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { ModalMenuFolderPage } from '../modal-menu-folder/modal-menu-folder.page';
import { ModalMenuProjectPage } from '../modal-menu-project/modal-menu-project.page';
import { ModalMultimediaPage } from '../modal-multimedia/modal-multimedia.page';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, tap, filter, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { InvitadoModalPage } from '../invitado-modal/invitado-modal.page';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.page.html',
  styleUrls: ['./folders.page.scss'],
})
export class FoldersPage implements OnInit {


  isAndroid: boolean = false;
  isIOS: boolean = false;

  //PARA USAR EL MODAL DE FOLDER-CONTENT--------------
  showOverlay: boolean = false;
  public projectId: any = null;
  public folderId = null;
  private pressTimer: any;
  public seleccionando: boolean = false; // Controla si se está en modo selección
  public multimediaSeleccionados: Set<number> = new Set(); // Guarda los IDs seleccionados
  public carpetasSeleccionadas: Set<number> = new Set();
  //--------------------------------------------------

  public theProject: any = null;
  public folders: any = [];
  public foldersIds: any = [];
  private language_code: string = 'en';
  public isDateEnd: boolean = true;

  //SEGUIMIENTO DE TIEMPO
  private interval: any = null;;
  private countSeg: number;
  private previousDate: Date | null = null;
  private isActive2: boolean = true;
  private routerSubscription: Subscription;
  //-----------------------------------------
  isChargeLoading: boolean = false;

  private folderChangeSubscription: Subscription | null = null;
  private mediaActivatedSubscription: Subscription | null = null;



  //---------------------------------------------
  public multimedias:any=[];
  public multimediaIds: any = [];

  //---------------------------------------------

  public uploadProgress:any=0;
  uploadProgressList: { name: string; progress: number; completed: boolean }[] = [];



  constructor(
    private http: HttpClient,
    private platform: Platform,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    //private camera: Camera,
    public auth: AuthenticationService,
    public navController: NavController,
    private translate: TranslateService,
    private router: Router,//SEGUIMIENTO DE TIEMPO
    private routerOutlet: IonRouterOutlet,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {

    this.isIOS = this.platform.is('ios');
    this.isAndroid = this.platform.is('android');
    this.theProject = history.state.projectSelected;
    console.log("LOG DE PROYECTO : ", this.theProject);
    
  }

  ngOnInit() {

    console.log(this.translate.langs.length);

    this.utilities.getLang().then((result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo == null) {
        console.log("No idioma");
        this.utilities.saveLang('en');


      } else {

        this.switchLanguage(prefijo || 'en');

      }
      this.obtainProjectFolders();
    });

    this.apiService.foldersChanges.subscribe(() => {
      console.log('<--------(foldersChanges)---------->');

      this.obtainProjectFolders();

    });

   

    this.apiService.folderChanges.subscribe((folder) => {
      console.log('<<<<<<folderChanges');
      console.log(folder);
      if (folder.type == 'update') {
        const index = this.folders.findIndex(item => item.id === folder.folder.id);
        if (index !== -1) {
          this.folders[index].name = folder.folder.name;
        }
      }
      else if (folder.type == 'delete') {
        const index = this.folders.findIndex(item => item.id === folder.folder);
        if (index !== -1) {
          console.log('<<<<<<ENTROOOOOfolderChanges');
          this.folders.splice(index, 1);
        }
      }
      else if(folder.type=='newProjectLink'){
          if(folder.link.folder_id==this.folderId){
            console.log('link nuevo:', folder.link);
            this.multimedias.unshift(folder.link);
          }
        }
    });


  }

  ionViewDidEnter() {
    

     if (!this.mediaActivatedSubscription) {
      this.mediaActivatedSubscription = this.apiService.mediaActivated.subscribe(funcion => {
        this.adjuntarMultimediaWeb();
      });  
    }




  }

  switchLanguage(language: string) {
    this.translate.use(language); // Cambiar el idioma en el servicio de traducción
    this.language_code = language;

  }

  goBack() {
    //antes que nada quiero que compruebes si se puede o no hacer pop() si no se puede usa un back y le pasas como argumento 'projectSelected' que sea de valor el id del proyecto

    if (this.routerOutlet && this.routerOutlet.canGoBack()) {
      this.routerOutlet.pop();
    } else {
      //this.utilities.showToast("uso back");
      this.navController.pop();
    }
  }


  obtainProjectFolders() {
    // this.utilities.showLoading();
    this.isChargeLoading = true;

    this.folders = [];
    this.foldersIds = [];
    this.multimedias = [];
    this.multimediaIds = [];
    this.apiService./*obtainProjectFolders*/obtainProjectFoldersAndFiles({ projectId: this.theProject.id, foldersIds: this.foldersIds,multimediasIds:this.multimediaIds, language_code: this.language_code }).subscribe((result) => {
      console.log('Result', result);

      if (result['state'] && result['state'] == 'DATE_ENDED') {
        this.utilities.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));
        this.isDateEnd = true;
      }
      else {
        this.isDateEnd = false;

        this.folders = this.folders.concat(result['folders']);//concadenar listado vehiculos
        this.foldersIds = this.foldersIds.concat(result['foldersIds']);//añado nuevos ids
        
        // Procesar multimedia de la respuesta
        if (result['multimedias']) {
          this.multimedias = this.multimedias.concat(result['multimedias']);
          this.multimediaIds = this.multimediaIds.concat(result['multimediasIds']);
        }
      }

      //this.utilities.dismissLoading();
      this.isChargeLoading = false;


    }, error => {

      this.translate.get('folders.No se obtuvieron las carpetas del proyecto').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
      console.log(error);
      //this.utilities.dismissLoading();
      this.isChargeLoading = false;

      //this.actu=true;

    });
  }


  onIonInfinite(ev) {
    this.getMoreFolders();
    console.log(ev);
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }


  getMoreFolders() {
    //this.utilities.showLoading('');
    this.isChargeLoading = true;


    console.log('>>>>>>>>>>>>more folders>>>>>>>>>>');
    this.apiService.obtainProjectFolders({ projectId: this.theProject.id, foldersIds: this.foldersIds, language_code: this.language_code }).subscribe((result) => {
      console.log('Result2', result);

      if (result['state'] && result['state'] == 'DATE_ENDED') {
        this.utilities.showToast(this.translate.instant("El proyecto ha finalizado, no puede realizar modificaciones"));
        this.isDateEnd = true;
      }
      else {
        this.isDateEnd = false;
        this.folders = this.folders.concat(result['folders']);//concadenar listado vehiculos

        this.foldersIds = this.foldersIds.concat(result['foldersIds']);//añado nuevos ids
      }

      //this.utilities.dismissLoading();
      this.isChargeLoading = false;


    }, error => {
      this.translate.get('folders.No se obtuvieron las carpetas del proyecto').subscribe((translatedText: string) => {
        this.utilities.showToast(translatedText);
      });
      console.log(error);
      //this.actu=true;
      // this.utilities.dismissLoading();
      this.isChargeLoading = false;


    });
  }

  goNewFolder() {

    console.log(this.theProject.id);
    const pro = this.theProject.id;
    console.log('pre');
    this.navController.navigateForward("/new-folder", { state: { projectId: pro } });


  }

  goFolderContent($folder) {

    //creator:this.theProject?.isCreator,isVerifiedUser:this.theProject?.isVerifiedUser,isAdmin:this.theProject?.isAdmin


    const folder = $folder.id;
    console.log(folder);
    console.log(this.theProject.id);
    const pro = this.theProject.id;
    this.navController.navigateForward("/folder-content", { state: { folderId: folder, projectId: pro, creator: this.theProject?.isCreator, isVerifiedUser: this.theProject?.isVerifiedUser, isAdmin: this.theProject?.isAdmin } });


  }





  ionViewWillEnter() {
    console.log("SE EJECUTA ionViewWillEnter");





    if(!this.folderChangeSubscription) {
      this.folderChangeSubscription =this.apiService.folderChanges.subscribe((folder) => {
        
        if(folder.type=='create'){

          if(folder.folder.folder_id==this.folderId){
            console.log('FOLDERCONTENT:', folder.folder);
            this.folders.unshift(folder.folder);
          }
          

        }
        
        
      });
    }







    App.addListener('appStateChange', (state) => {
      console.log("se lanza evento ACTIVO/INACTIVO");
      this.isActive2 = state.isActive;
      if (this.isActive2) {
        const currentRoute = this.router.url;
        if (currentRoute.includes('/folders')) {
          console.log("DENTRO DE IF EVENTO MODO: ACTIVO");
          //this.startInterval();
        }
      }
      else {
        //this.clearInterval();

      }

    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Verifica si la ruta actual no es '/UserSearch'
        if (!event.url.includes('/folders')) {
         // console.log('Saliendo de folders, limpiando intervalos');
          //this.clearInterval();
        }
        else {
          //this.startInterval();
        }
      }
    });



    if (this.interval == null) {
      //this.startInterval();
    }


  }


  ionViewWillLeave() {
    console.log("Se ejecuta ionViewWillLeave");
    //this.clearInterval();
  }


  ngOnDestroy() {


    if (this.folderChangeSubscription) {
      this.folderChangeSubscription.unsubscribe();
      this.folderChangeSubscription = null;
    }

    if (this.mediaActivatedSubscription) {
      this.mediaActivatedSubscription.unsubscribe();
      this.mediaActivatedSubscription = null;
    }


    //this.clearInterval();
  }




  // Inicia el intervalo para ejecutar la función cada 5 segundos
  private startInterval() {
    this.countSeg = 0;
    this.previousDate = new Date();
    if (this.interval == null) {
      console.log("INTERVAL NULL CREANDO UNO NUEVO-----------------------------------");
      this.interval = setInterval(() => {
        this.checkDateDifference();
      }, 2000);
    }

  }

  // Limpia el intervalo cuando se sale de la pestaña
  private clearInterval() {

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
      console.log("Suscripción al router cancelada correctamente");
    }

    if (this.interval) {

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({ screenId: 35, screenTime: this.countSeg }).subscribe((result) => {
        console.log('DATOS', result);

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


    if (!this.isActive2) {

      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg = this.countSeg + differenceInSeconds;
      console.log(`folders: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);

      //ENVIO TIEMPO
      this.apiService.registerTimeScreen({ screenId: 35, screenTime: this.countSeg }).subscribe((result) => {
        console.log('DATOS', result);

      }, error => {

        console.log(error);
      });

      //this.clearInterval();
      return;
    }




    if (this.isActive2) {
      const differenceInSeconds = Math.floor((currentDate.getTime() - this.previousDate.getTime()) / 1000);
      this.countSeg = this.countSeg + differenceInSeconds;
      console.log(`folders: Diferencia en segundos: ${differenceInSeconds} , contador actual: `);
      console.log(this.countSeg);


    }
    else {
      console.log('folders: No hay fecha anterior, usando la actual como inicial.');
    }


    this.previousDate = currentDate;
  }

  async abrirModalMenuProject() {


    this.showOverlay = true;
    let titleText = this.translate.instant('folder-content.Máximo alcanzado');
    let infoText = this.translate.instant('folder-content.Hazte con el plan 360 para subir contenido de forma ilimitada');

    const modal = await this.modalCtrl.create({
      component: ModalMenuProjectPage,
      cssClass: 'EditFolderModal',
      componentProps: {
        folderId: -1,
        projectId: this.theProject.id,


      }, initialBreakpoint: 0.33,     // Altura 1/3
      // Solo ese breakpoint
      handle: false,               // 🔒 No muestra el handle (línea de arrastre)
      handleBehavior: 'none',      // 🔒 Desactiva el arrastre
      backdropDismiss: true,      // Si se cierra tocando fuera
      canDismiss: true,            // Se puede cerrar por código
      showBackdrop: false           // Activa fondo semitransparente 
    });

    modal.onDidDismiss().then((data) => {
      this.showOverlay = false;
      console.log(data);
      let opcSelected = (data.data?.opcSelected);
      console.log('OPCIÓN SELECCIONADA: ', opcSelected);



      /*if(){
        this.uploadMedia();
       }*/





      // let newName = (data.data?.newName); 
      // this.theFolder.name=newName;
      //this.folderName=newName;


    });
    return await modal.present();
  }

  startPress(folder: any) {
    this.pressTimer = setTimeout(() => {
      console.log('FOLDER ID:', folder);
      this.mostrarSeleccionBorrado();
    }, 1000); // 1 segundo
  }

  mostrarSeleccionBorrado() {
    this.seleccionando = !this.seleccionando; // Activa o desactiva la selección
    if (!this.seleccionando) {
      this.multimediaSeleccionados.clear(); // Si se desactiva, limpia la selección
      this.carpetasSeleccionadas.clear(); // Limpia carpetas seleccionadas también
    }
  }

  cancelPress() {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
  }

  toggleSeleccion(itemId: number) {
    if (!this.seleccionando) return;

    // Buscar si es una carpeta o multimedia
    const folder = this.folders.find(item => item.id === itemId);
    const multimedia = this.multimedias.find(item => item.id === itemId);

    if (folder) {
      // Es una carpeta
      if (this.carpetasSeleccionadas.has(itemId)) {
        this.carpetasSeleccionadas.delete(itemId);
      } else {
        this.carpetasSeleccionadas.add(itemId);
      }
    } else if (multimedia) {
      // Es multimedia
      if (this.multimediaSeleccionados.has(itemId)) {
        this.multimediaSeleccionados.delete(itemId);
      } else {
        this.multimediaSeleccionados.add(itemId);
      }
    }
  }

  selectItem(item: any) {
    if (this.seleccionando) {
      this.toggleSeleccion(item.id);
    } else {
      // Lógica normal para seleccionar item
      if (item.thetype === 'folder') {
        this.goFolderContent(item);
      }
      else if(item.thetype=='imagen'){
      this.abrirModalMultimedia1(item.thevalue, item.thetype,item.id)
    }
    else if(item.thetype=='PDF'){
      this.abrirModalMultimedia(item.thevalue, item.thetype, item.id,item)
    }
    else if(item.thetype=='link'){
      this.redirectToSocial(item.link_value);
    } 
    else if(item.thetype=='video'){
      this.abrirModalMultimedia(item.thevalue, item.thetype, item.id,item)

    }
    else {
        // Manejar multimedia (abrir modal, etc.)
        console.log('Selected multimedia:', item);
      }
    }
  }

  get totalSeleccionados(): number {
    return this.multimediaSeleccionados.size + this.carpetasSeleccionadas.size;
  }

  extractOriginalName(multimedia: any): string {
    try {
      if (multimedia.archive) {
        const archive = JSON.parse(multimedia.archive);
        if (archive && archive.length > 0) {
          return archive[0].original_name || 'Sin nombre';
        }
      }
      return 'Sin nombre';
    } catch (error) {
      return 'Sin nombre';
    }
  }

  formatCreateDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return '';
    }
  }

  async eliminarSeleccionados() {
    if (this.multimediaSeleccionados.size > 0 || this.carpetasSeleccionadas.size > 0) {
      let valtext = this.translate.instant('¿Está seguro de eliminar?');
      const alert = await this.alertCtrl.create({
        header: this.translate.instant('Confirmar'),
        message: valtext,
        buttons: [
          {
            text: this.translate.instant('Cancelar'),
            role: 'cancel',
          },
          {
            text: this.translate.instant('Eliminar'),
            handler: () => {
              this.confirmarEliminacion();
            },
          },
        ],
      });
      await alert.present();
    }
    else{
      this.utilities.showToast(this.translate.instant('No hay elementos seleccionados para eliminar'));
    }
  }


  confirmarEliminacion() {
    const multimediaArray = Array.from(this.multimediaSeleccionados);
    const carpetasArray = Array.from(this.carpetasSeleccionadas);

    // Eliminar multimedia individualmente
    if (multimediaArray.length > 0) {
      let eliminados = 0;
      this.apiService.deleteMultimediaArray({files : multimediaArray}).subscribe(
        (result) => {
          this.utilities.showToast(this.translate.instant('Multimedia eliminado correctamente'));
          // Remover de la lista local
          this.multimedias = this.multimedias.filter(m => !this.multimediaSeleccionados.has(m.id));
          this.multimediaSeleccionados.clear();
          if (this.carpetasSeleccionadas.size === 0) {
            this.mostrarSeleccionBorrado(); // Salir del modo selección si no hay carpetas
          }
        },
        (error) => {
          this.utilities.showToast(this.translate.instant('Error al eliminar multimedia'));
          console.error(error);
        }
      );

      // multimediaArray.forEach(id => {
      //   this.apiService.deleteMultimedia(id).subscribe(
      //     (result) => {
      //       eliminados++;
      //       if (eliminados === multimediaArray.length) {
      //         this.utilities.showToast(this.translate.instant('Multimedia eliminado correctamente'));
      //         // Remover de la lista local
      //         this.multimedias = this.multimedias.filter(m => !this.multimediaSeleccionados.has(m.id));
      //         this.multimediaSeleccionados.clear();
      //         if (this.carpetasSeleccionadas.size === 0) {
      //           this.mostrarSeleccionBorrado(); // Salir del modo selección si no hay carpetas
      //         }
      //       }
      //     },
      //     (error) => {
      //       this.utilities.showToast(this.translate.instant('Error al eliminar multimedia'));
      //       console.error(error);
      //     }
      //   );
      // });
    }

    // Eliminar carpetas individualmente
    if (carpetasArray.length > 0) {
      let eliminados = 0;
      carpetasArray.forEach(id => {
        this.apiService.deleteFolder({ folderId: id }).subscribe(
          (result) => {
            eliminados++;
            if (eliminados === carpetasArray.length) {
              this.utilities.showToast(this.translate.instant('Carpetas eliminadas correctamente'));
              // Remover de la lista local
              this.folders = this.folders.filter(f => !this.carpetasSeleccionadas.has(f.id));
              this.carpetasSeleccionadas.clear();
              if (this.multimediaSeleccionados.size === 0) {
                this.mostrarSeleccionBorrado(); // Salir del modo selección si no hay multimedia
              }
            }
          },
          (error) => {
            this.utilities.showToast(this.translate.instant('Error al eliminar carpetas'));
            console.error(error);
          }
        );
      });
    }
  }



  async abrirModalMultimedia1($media,$type,$id){
  
      if(this.seleccionando!=true){
  
        const modal = await this.modalCtrl.create({
          component: ModalMultimediaPage,
          cssClass: 'MultimediaModal',
          componentProps: {
            mediaArchive: $media,
            mediaType:$type,
            id:$id,
            pdfName:'',
          },
        // backdropDismiss:false
        });
        return await modal.present();
      }
    }



     async abrirModalMultimedia($media,$type,$id,$multimedia){

      if(this.seleccionando!=true){

        let name=this.extractOriginalName($multimedia);

        const modal = await this.modalCtrl.create({
          component: ModalMultimediaPage,
          cssClass: 'MultimediaModal',
          componentProps: {
            mediaArchive: $media,
            mediaType:$type,
            id:$id,
            pdfName:name,
          },
        // backdropDismiss:false
        });
        return await modal.present();
      }
    }


     redirectToSocial(url: string) {
        // Verifica si la URL es válida y luego redirige al navegador
        if (url) {
          window.location.href = url;
        }
      }




    public adjuntarMultimediaWeb() {
      
      const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.png, .jpg, .jpeg, .mp4, .pdf';
        fileInput.multiple = true;
        
        fileInput.addEventListener('change', (event) => {
          const files = (event.target as HTMLInputElement).files;
          
          if (files && files.length > 0) {
            const validExtensions = ['.png', '.jpg', '.jpeg', '.mp4', '.pdf', '.mov'];
            const filesArray = Array.from(files);
            
            const validFiles = filesArray.filter(file => {
              const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
              const isValid = validExtensions.includes(ext);
              if (!isValid) {
                const message = this.translate.instant("Tipo de archivo no permitido") + `: ${file.name}, ` + this.translate.instant("se excluirá del listado");
                this.utilities.showToast(message);
              }
              return isValid;
            });
            
            if (validFiles.length === 0) return;
            
            // this.utilities.showLoading('');
            this.isChargeLoading=true;
            
            this.uploadProgressList = []; // reset progress
            
            let processedCount = 0;
            this.apiService.menuMustClose.next();
      
            validFiles.forEach((selectedFile, index) => {
              const fileName = selectedFile.name;
      
              // Inicializar barra individual
              this.uploadProgressList.push({ name: fileName, progress: 0, completed: false });
      
              const formData = new FormData();
              formData.append('multimediaFile', selectedFile);
              formData.append('project_id', this.theProject.id);
              formData.append('folder_id', this.folderId);
              formData.append('language_code', this.language_code);
      
              this.http.post(environment.apiUrl + 'multimediaWeb', formData, {
                headers: this.apiService.httpOptionsFiles.headers,
                reportProgress: true,
                observe: 'events'
              }).pipe(
                tap(event => {
                  if (event.type === HttpEventType.UploadProgress) {
                    const progress = Math.round((100 * event.loaded) / (event.total || 1));
                    this.uploadProgressList[index].progress = progress;
                    console.log(`📤 Subiendo ${fileName}: ${progress}%`);
                  }
                }),
                filter(event => event.type === HttpEventType.Response),
                map((event: any) => event.body)
              ).subscribe(result => {
                this.uploadProgressList[index].completed = true;
      
                if (result['state'] === 'UPLOADED') {
                  const m = result['nuevoContenido'];
                  this.multimediaIds.push(m?.id);
                  this.multimedias.unshift(m);
      
                  this.translate.get('folder-content.Nuevo contenido subido correctamente')
                    .subscribe(translatedText => {
                      this.utilities.showToast(translatedText);
                    });
      
                } else if (result['state'] === 'NOTALLOWED') {
                  // this.apiService.menuMustClose.next();
                  this.abrirModalInvitado();
                }
      
                processedCount++;
                if (processedCount === validFiles.length) {
                 // this.utilities.dismissLoading();
                  this.isChargeLoading=false;
    
                  setTimeout(() => this.uploadProgressList = [], 1000); // Oculta las barras tras 1s
                }
      
              }, error => {
                console.log('❌ Error al cargar archivo:', error);
                processedCount++;
                if (processedCount === validFiles.length) {
                  //this.utilities.dismissLoading();
                  this.isChargeLoading=false;
    
                  setTimeout(() => this.uploadProgressList = [], 1000);
                }
              });
            });
          }
        });
      
        fileInput.click(); // Abre el selector
      }




      async abrirModalInvitado(){
      
      
          let titleText=this.translate.instant('folder-content.Máximo alcanzado');
          let infoText=this.translate.instant('folder-content.Hazte con el plan 360 para subir contenido de forma ilimitada');
      
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
             // this.navController.pop();
              this.navController.back();
             }
      
          
          });
          return await modal.present();
        }

}
