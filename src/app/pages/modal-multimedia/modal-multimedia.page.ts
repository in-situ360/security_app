import { Component, OnInit } from '@angular/core';
import {AlertController, ModalController, NavController, NavParams, Platform} from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { AllImageCropperPage } from '../all-image-cropper/all-image-cropper.page';
import { JobImageCropperPage } from '../job-image-cropper/job-image-cropper.page';
import { SelectMenuEditMediaPage } from '../select-menu-edit-media/select-menu-edit-media.page';

@Component({
  selector: 'app-modal-multimedia',
  templateUrl: './modal-multimedia.page.html',
  styleUrls: ['./modal-multimedia.page.scss'],
})
export class ModalMultimediaPage implements OnInit {

  public mediaArchive:any=null;
  public mediaType:any=null;
  public id:any='0';
  public fromProfile:any=null;
  public canEdit:any=null;
  public fromJobs:any=null;

  isAndroid: boolean = false;
  isIOS: boolean = false;

  public theName:any='';

  zoom:number=1;
  
  
  
  //obtainPDF = 'assets/imgs/Politicas.pdf'; 
  //public obtainPDFDefault:string='https://in-situ360.com/devxerintel/api/auth/getPDF/';
  public obtainPDFDefault:string='https://in-situ360.com/api/auth/getPDF/';

  public obtainPDF:string="";

  public base64img: string=null;
  public rutaImagen:string="assets/imgs/imagen-proyecto.png";
  public personalArchiveId:any=null;

  constructor(private platform: Platform,
    private modalCtrl: ModalController,
    private apiService: ApiService,
    private utilities: UtilitiesService,
    private navParams: NavParams,
    private translate: TranslateService,
    private alertController: AlertController,
  ) { 

    this.isIOS=this.platform.is('ios');
    this.isAndroid=this.platform.is('android');
  }

  ngOnInit() {
    this.mediaArchive = this.navParams.get('mediaArchive');
    this.mediaType = this.navParams.get('mediaType');
    this.fromProfile= this.navParams.get('fromProfile');
    this.fromJobs= this.navParams.get('fromJobs');
    this.canEdit=this.navParams.get('canEdit');
    this.personalArchiveId=this.navParams.get('id');
    console.log('mediaArchive-->',this.mediaArchive);
    console.log('this.fromProfile',this.fromProfile);
    

    if(this.fromJobs!=null){
      this.obtainPDFDefault='https://in-situ360.com/api/auth/getPersonalArchivePDF/';

    }
    else if(this.fromProfile!=null){
      this.obtainPDFDefault='https://in-situ360.com/api/auth/getPersonalArchivePDF/';
    }
    
    
    if(this.mediaArchive!=null){
      if(this.mediaType!=null){

        if(this.mediaType==='PDF'){
          this.id = this.navParams.get('id');
          this.theName= this.navParams.get('pdfName');
          //this.id='1';
          this.obtainPDF=this.obtainPDFDefault+this.id;
          console.log('PDF:');
          console.log(this.obtainPDF);

        }
        else if(this.mediaType==='imagen'){
          console.log('IMAGEN');
          

        }
        else{

          console.log('Tipo desconocido');
        }


      }
    }
  }

  ionViewDidEnter() {
    console.log(this.translate.langs.length);
  
    if (this.translate.langs.length == 0) {
      console.log("No idioma");
  
      this.utilities.saveLang('en');
    }
  }

  closeModal(){
    this.modalCtrl.dismiss({
      'dismissed': true
    });

  }


  cambiarZoom(){
    if(this.zoom==1){
      this.zoom+=0.5;
    }
    else{
      this.zoom-=0.5;
    }
  }



  async openJobImageCropper() {

   

      console.log(">>>>>>>>>>>>");

    
      const imageRuta=this.base64img;
      
    

      //if(this.isImageFile(imageRuta)){

        console.log(">>>>>>>>>>>>2");
      const modal = await this.modalCtrl.create({
        component: JobImageCropperPage,
        componentProps: { imageRuta,personalArchiveId:this.personalArchiveId }
      });

      modal.onDidDismiss().then((result) => {
        if (result.data) {
          console.log('Cropped Image:', result.data);
          //this.closeModal();

          if(result.data.newMediaArchive!=null ){
            this.mediaArchive=result.data.newMediaArchive;
            
            

            //console.log("dios que funcione>>>>>>>>>>>>");

            //console.log(this.base64img);

            //this.form.patchValue({ avatar: this.base64img });
           // this.rutaImagen = this.base64img;
          
          }


        }
      });

      return await modal.present();
    // }
      //else{
        //console.log('No es una imagen');
      //}
    
   
  }


  async abrirModalOpciones(){
          const modal = await this.modalCtrl.create({
            component: SelectMenuEditMediaPage,
            cssClass: 'SelectModal',
            componentProps: {
              mediaType: this.mediaType,
              
              
            },
           // backdropDismiss:false
          });
      
          modal.onDidDismiss().then((data) => {
           // const selectedNetwork = data.data?.selectedNetwork;
           const selectedOption = Number(data.data.selectedOption); 
           console.log('Opcion de usuario devuelta:', selectedOption);
            
    
            if(selectedOption==1){//
            this.openJobImageCropper();
           
      
      
            }
            else if(selectedOption==2){//
            // this.utilities.showToast("wwwww");
             this.mostrarAlertaBorrado();
      
            }
            else{
      
              console.log("cancelada");
            }
      
          
          
      
      
      
          });
      
      
          return await modal.present();
        }



    async mostrarAlertaBorrado() {

      const toastMensaje = await this.translate.get("¿Desea eliminar el trabajo?").toPromise();
      const toastMensaje2 = await this.translate.get("my-jobs.No").toPromise();
      const toastMensaje3 = await this.translate.get("my-jobs.Sí").toPromise();
      
      const alert = await this.alertController.create({
        //header:'Acceso denegado',
        message: toastMensaje,
        cssClass: 'custom-button-class',
        buttons: [
          {
            text: toastMensaje2,
            role: 'cancel',
            cssClass: 'custom-button-class',
            handler: () => {
              console.log('Clic en Cancelar');
            }
          },
          {
            text: toastMensaje3,
            cssClass: 'custom-button-class',
            handler: () => {
              console.log('Clic en Aceptar');
              console.log("JOB ID: ", this.personalArchiveId);

              

              this.apiService.deletePersonalArchive({multimediaId:this.personalArchiveId}).subscribe((result) => {
                //this.multimedias = this.multimedias.filter(multimedia => multimedia.id !== $id);
                this.apiService.deleteJobChange.next(this.personalArchiveId);
                
              this.closeModal();
                
                //this.apiService.userChanges2.next();
          
              }, async error => {
                const toastMensaje = await this.translate.get("my-jobs.Hubo un problema al borrar").toPromise();

              // this.utilities.showToast('Hubo un problema al borrar');
                  this.utilities.showToast(toastMensaje); 
              
                console.log(error);
              });

            },
            //cssClass: 'custom-button-class' 
          }
        ],
        backdropDismiss:false
      });

      await alert.present();
    }
}



