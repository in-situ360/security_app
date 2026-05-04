import { Component, OnInit } from '@angular/core';
import { Output, Input, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import {InfiniteScrollCustomEvent, ModalController, NavController,Platform } from '@ionic/angular';
import { ModalMultimediaPage } from 'src/app/pages/modal-multimedia/modal-multimedia.page';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';//MULTI LENGUAJE
import { TranslateModule } from '@ngx-translate/core';//MULTI LENGUAJE

@Component({
  selector: 'advertisement-item',
  standalone: true,
  imports: [IonicModule,CommonModule,TranslateModule],
  templateUrl: './advertisement-item.component.html',
  styleUrls: ['./advertisement-item.component.scss'],
})
export class AdvertisementItemComponent implements OnInit {


  @Input() advertisement:any=null;
  @Output() advertisementClicked=new EventEmitter<number>();
  @Output() deleteClicked=new EventEmitter<number>(); 

  constructor(private modalCtrl: ModalController,private translate: TranslateService,) { }

  ngOnInit() {}

  selectAdvertisement(){
    this.advertisementClicked.emit(this.advertisement.id);
  }

  sendDeleteOrder(){
    this.deleteClicked.emit(this.advertisement.id);
  }



  getDurationString(days: number): string {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
  
    const result = [];
  
    if (months > 0) {
      const monthText = months === 1
        ? this.translate.instant('my-ads.mes')
        : this.translate.instant('my-ads.meses');
      result.push(`${months} ${monthText}`);
    }
  
    if (remainingDays > 0) {
      const dayText = remainingDays === 1
        ? this.translate.instant('my-ads.día')
        : this.translate.instant('my-ads.dias');
      result.push(`${remainingDays} ${dayText}`);
    }
  
    // Si no hay meses ni días
    if (result.length === 0) {
      return `0 ${this.translate.instant('my-ads.dias')}`;
    }
  
    return result.join(this.translate.instant('my-ads. y '));
  }
  
  



  async abrirModalMultimedia1($media,$type,$id){
  
    
  
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
