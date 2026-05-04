import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { ApiService } from './api.service';
import { UtilitiesService } from './utilities.service';
import { Notification } from '../models/Notification';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesNuevasService {

  private counter = 0;

  private notificationItemCount = new BehaviorSubject<number>(0);
  public notificationChanges = new Subject<Notification[]>();

  private notifications: Notification[];

  constructor(private alertCtrl: AlertController, private apiService: ApiService, private utilitiesService: UtilitiesService, private translateService: TranslateService) {
    //this.checkNotifications();
  }


  /*public getNotifications(){
    this.apiService.getEntity('notifications').subscribe((notifications: Notification[])=>{
      console.log("mis notificaciones", notifications);
      
      this.notifications = null;
      this.notifications = notifications;

      this.notificationChanges.next();
    },(error)=>{
      this.utilitiesService.showToast('Error al obtener el listado de notificaciones');
    })
  }*/

  //public addNotification(data){
  //  this.notificationChanges.next(data);
  //}




  public addNotification(data){
    console.log('llega')
    //
    this.notificationChanges.next(data);
    //
    this.remove();
    console.log('llega2')
    
  }

  remove() {


    

    // this.id=setInterval(() => {
      
    //   PushNotifications.removeAllDeliveredNotifications();
    //   clearInterval(this.id);

    // }, 5000);


   }



  public getObservable() : Subject<any>{
    return this.notificationChanges;
  }


  public getNotificationsArray(){
    return this.notifications;
  }

  public checkNotifications(){
      this.apiService.getEntity('notificationsNuevas').subscribe((count) => {
      this.notificationItemCount.next(count);

      //this.events.publish('notification:badge');
      

    }, (error) => {
      console.log("Error al obtener las notificaciones nuevas");

    });
    
  }

  /*public getNotificationsItemCount() {
    return this.notificationItemCount.value;
  }*/

  /*public addNotification(): void {
    
    this.notificationItemCount.next(this.notificationItemCount.value + 1);
    //this.events.publish('notification:badge');


  }*/

/*
  public deleteNewNotification(id:number): void {
    
    let notificationIndex = this.notifications.findIndex(element => element.id == id);

    this.apiService.getEntity('notificationsNuevas', id).subscribe((count)=>{
      this.notificationItemCount.next(this.notificationItemCount.value - 1);
      //this.events.publish('notification:badge');
      this.notifications[notificationIndex].nueva = 0;
      this.translateService.get('Notificación marcada como vista').subscribe((translatedText: string) => {
        this.utilitiesService.showToast(translatedText);
      });

    }, (error)=>{
      console.log("Error al obtener las notificaciones nuevas");
      
    });

  }


  public deleteNotification(id:number) {
    

    this.apiService.deleteEntity('notifications', id).subscribe((count) => {
      //this.notificationItemCount.next(this.notificationItemCount.value - 1);

      this.notifications.splice(this.notifications.findIndex(element => element.id == id), 1);

      this.translateService.get('Notificación eliminada correctamente').subscribe((translatedText: string) => {
        this.utilitiesService.showToast(translatedText);
      });

    }, (error) => {
      console.log("Error al obtener las notificaciones nuevas");

    });

  }


  

  public clearNotifications(): void {
    
    this.notificationItemCount.next(0);
  }*/
}