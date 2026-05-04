import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { AddRemoveUsersModalPage } from 'src/app/pages/add-remove-users-modal/add-remove-users-modal.page';
import { SelectChatoptionsModalPage } from 'src/app/pages/select-chatoptions-modal/select-chatoptions-modal.page';
import { ApiService } from 'src/app/services/api.service';//para bd


@Component({
  selector: 'app-app-pgchat-header',
  templateUrl: './app-pgchat-header.component.html',
  styleUrls: ['./app-pgchat-header.component.scss'],
})
export class AppPgchatHeaderComponent implements OnInit {

  @Input() chatName: string;
  @Input() lastMessage: string;
  @Input() avatar: string;
  @Input() chat_id: any;



  id:any = 0;
  muestra:boolean=false;
  user:any=null;

  imgAvatar:any='';
  isAndroid: boolean = false;
  isIOS: boolean = false;
  constructor(private modalCtrl: ModalController,private platform: Platform,private navCtrl: NavController,private apiService: ApiService) { 

    
  }


  goBack() {
    //ANTESS this.navCtrl.pop()
    this.navCtrl.pop();
  }


  ngOnInit() {


    this.isAndroid = this.platform.is('android');
     this.isIOS = this.platform.is('ios');

     console.log('el puto avatar:',this.avatar);


     if(this.avatar==null || this.avatar==''){

      this.imgAvatar='assets/imgs/splash.png';
  
     } 
     else{
  
      this.imgAvatar=this.avatar;
  
     }

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


  async abrirModalOpcionesUsuario(){
      const modal = await this.modalCtrl.create({
        component: SelectChatoptionsModalPage,
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
        
        if(selectedOption==1){//AÑADIR USUARIOS
          this.abrirModalEditarUsuarios(1);
        
  
  
        }
        else if(selectedOption==2){//QUITAR USUARIOS
          this.abrirModalEditarUsuarios(2);
  
        }
        else{
  
          console.log("cancelada");
        }
  
      
      
  
  
  
      });
  
  
      return await modal.present();
    }





    async abrirModalEditarUsuarios($OPC){
    
        
          const modal = await this.modalCtrl.create({
            component: AddRemoveUsersModalPage,
            cssClass: '',
            componentProps: {
              chatId: this.chat_id,
              opc:$OPC
              
              
            },
          });
          return await modal.present();
        }
    
    
    
        

  

}
