import { Component, OnInit } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { codeErrors, confirmPassword } from 'src/app/utils/utils';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.page.html',
  styleUrls: ['./info-modal.page.scss'],
})
export class InfoModalPage implements OnInit {

  constructor(private utilitiesService: UtilitiesService,
  private translate: TranslateService) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    console.log(this.translate.langs.length);
  
    if (this.translate.langs.length == 0) {
      console.log("No idioma");
  
      this.utilitiesService.saveLang('es');
    }
  }

}
