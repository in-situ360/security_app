import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/User';
import { ApiService } from 'src/app/services/api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { codeErrors } from 'src/app/utils/utils';
import { Camera, CameraResultType } from '@capacitor/camera';
import { PushNotifications } from '@capacitor/push-notifications';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  public user: User;
  public form: FormGroup;
  public base64img: string;
  public isLoading: boolean = true;

  constructor(
    private apiService: ApiService,
    private utilities: UtilitiesService,
    //private camera: Camera,
    public auth: AuthenticationService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    /*this.form = new FormGroup({
      name: new FormControl(''),
      email: new FormControl(''),
      avatar: new FormControl('')
    });

    this.apiService.getEntity('user').subscribe((user: User) => {
      this.user = user;
      this.form.patchValue(user);
      this.isLoading = false;
    }, error => {
      this.utilities.showToast("Error obteniendo el usuario");
      this.isLoading = false;
    });*/


  }

  async ionViewDidEnter(){

    this.form = new FormGroup({
      name: new FormControl(''),
      email: new FormControl(''),
      avatar: new FormControl('')
    });

    

    console.log(this.translate.langs.length);
    
      if (this.translate.langs.length == 0) {
        console.log("No idioma");
    
        this.utilities.saveLang('en');
      }
      else{
        const currentLang = this.translate.currentLang;
        console.log("Idioma actual:", currentLang);
        this.form.patchValue({ language_code: currentLang });
       
       
      }

      this.apiService.getEntity('user').subscribe((user: User) => {
        this.user = user;
        this.form.patchValue(user);
        this.isLoading = false;
      }, error => {
        this.utilities.showToast(this.translate.instant("Error obteniendo el usuario"));
        this.isLoading = false;
      });
    
    }



  public submitForm(): void {
    this.apiService.updateUser(this.form.value).subscribe((user: User) => {
      this.utilities.showToast(this.translate.instant('Usuario actualizado correctamente'));
    }, (error) => {
      this.utilities.showToast(this.translate.instant(codeErrors(error)));

     // this.utilities.showToast(codeErrors(error));
    });
  }

  public async adjuntarImagen() {

    const permissions = await Camera.requestPermissions();


    if(permissions.photos === 'denied' || permissions.camera === 'denied') {
      console.log("permiso camera " , permissions);
      
    }
    const image = await Camera.getPhoto({
      promptLabelHeader: 'Fotos',
      promptLabelCancel: 'Cancelar',
      promptLabelPhoto: 'Galería',
      promptLabelPicture: 'Cámara',
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64
    });
  
    console.log(image);
    
    // image.webPath will contain a path that can be set as an image src.
    // You can access the original file using image.path, which can be
    // passed to the Filesystem API to read the raw data of the image,
    // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
    this.base64img = 'data:image/jpeg;base64,' + image.base64String;
  
    console.log("imagen " ,this.base64img);

    this.form.patchValue({avatar : this.base64img})
    this.user.avatar = this.base64img;

    // Can be set to the src of an image now
    //imageElement.src = imageUrl;
  }
}
