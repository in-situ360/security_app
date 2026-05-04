import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Notification } from 'src/app/models/Notification';

@Component({
  selector: 'app-notification-item',
  templateUrl: './app-notification-item.component.html',
  styleUrls: ['./app-notification-item.component.scss'],
})
export class AppNotificationItemComponent implements OnInit {

  @Input() notification: Notification;
  @Output() onDelete = new EventEmitter<number>();


  constructor() { }

  ngOnInit() {}

  public deleteNotification(id: number): void {
    this.onDelete.emit(id);
  }
}
