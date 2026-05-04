import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, NavController, Platform } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';//para bd

import { SelectUseroptionsModalPage } from '../../pages/select-useroptions-modal/select-useroptions-modal.page';

import { SelectReportModalPage } from '../../pages/select-report-modal/select-report-modal.page';
import { TranslateService } from '@ngx-translate/core';
import { UtilitiesService } from 'src/app/services/utilities.service';


@Component({
  selector: 'app-app-pnchat-header',
  templateUrl: './app-pnchat-header.component.html',
  styleUrls: ['./app-pnchat-header.component.scss'],
})
export class AppPnchatHeaderComponent implements OnInit {

  @Input() chatName: string;
  @Input() lastMessage: string;
  @Input() avatar: string;
  @Input() chat_id: any;
  @Input() telNumber: any;
  @Input() user_id: any;

  id:any = 0;
  muestra:boolean=false;
  user:any=null;

  isAndroid: boolean = false;
  isIOS: boolean = false;

  public textConect:string='';

  constructor(private utilities: UtilitiesService,private translate: TranslateService,private alertCtrl: AlertController,private platform: Platform,private navCtrl: NavController,private apiService: ApiService,private modalCtrl: ModalController) { }


  goBack() {
    //ANTESS this.navCtrl.pop()
    this.navCtrl.pop();
  }


  ngOnInit() {


    this.isAndroid = this.platform.is('android');
     this.isIOS = this.platform.is('ios');

     this.textConect=this.translate.instant('app-pnchat-header.Conectado');

   /* this.id=setInterval(() => {
      

      this.apiService.getIsOnline(this.chat_id).subscribe((user)=>{
        //console.log(user);
        this.muestra=true;
        this.user=user;
        
      }, error => {
            
            console.log(error);
          });

    }, 2500);*/


  }


  ngOnDestroy() {
    
    //clearInterval(this.id);
    
  }

  goToOtherUser(){
    this.navCtrl.navigateForward("/other-user", {state: {userId:this.user_id}});
  }



  async abrirModalOpcionesUsuario(){
    const modal = await this.modalCtrl.create({
      component: SelectUseroptionsModalPage,
      cssClass: 'SelectModal',
      componentProps: {
       /* district: this.charge.mesaControl.district,*/
        
        
      },
     // backdropDismiss:false
    });

    modal.onDidDismiss().then((data) => {
     // const selectedNetwork = data.data?.selectedNetwork;
     const selectedOption = Number(data.data.selectedNetwork); 
     console.log('Opcion de usuario devuelta:', selectedOption);
      
      if(selectedOption==1){//BLOQUEAR USUARIO
        this.bloquear();
      


      }
      else if(selectedOption==2){//REPORTAR USUARIO
        this.abrirModalReporte();

      }
      else{

        console.log("cancelada");
      }

    
    



    });


    return await modal.present();
  }



  public async bloquear() {

    let valtext=this.translate.instant('¿Desea bloquear a este usuario?');
    const alert = await this.alertCtrl.create({
      header: '',
      message: valtext,
      buttons: [
        {
          text: this.translate.instant('cancelar'),
          role: 'cancel'
        },
        {
          text: this.translate.instant('bloquear'),
          handler: () => {
            this.apiService.blockUser({ userToBlockeId:this.user_id }).subscribe((result) => {
      
              console.log("RESULTADO>>>>>>>>>>>"); 
              console.log(result);
              if(result['state']=="USERBLOCKED"){
                this.translate.get('Usuario bloqueado').subscribe((translatedText: string) => {
                  this.utilities.showToast(translatedText); 
                });
              }
              else if(result['state']=="COINCIDENCE"){
                this.translate.get('El usuario ya se encuentra bloqueado').subscribe((translatedText: string) => {
                  this.utilities.showToast(translatedText); 
                });
    
              }
              else{
                this.translate.get('Respuesta desconocida').subscribe((translatedText: string) => {
                  this.utilities.showToast(translatedText); 
                });
              }
    
             }, error => {
              console.log(error);
          });
           
            
          }
        }
      ]
    });

    await alert.present();

  }


  async abrirModalReporte(){

    
      const modal = await this.modalCtrl.create({
        component: SelectReportModalPage,
        cssClass: 'reportModal',
        componentProps: {
          userToReportId: this.user_id,
          
          
        },
      });
      return await modal.present();
    }


}
