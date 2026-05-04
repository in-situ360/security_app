import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-chat-group',
  templateUrl: './app-chat-group.component.html',
  styleUrls: ['./app-chat-group.component.scss'],
})
export class AppChatGroupComponent implements OnInit {

  @Input() icon: string;
  @Input() showOptions: boolean;
  @Input() redirection: string [];
  @Input() title?: string;
  @Input() subtitle: string;
  @Input() lastMessage: string;
  @Input() newMessages: number;
  @Input() slidingOptionsSide: string;
  @Input() slidingOptionsColor: string;
  @Input() slidingOptionsIcon: string;
  @Input() chatId: number;

  public textMenNue:string='';
  @Output() ajusteClick = new EventEmitter<number>();

  constructor(private translate: TranslateService,) { }

  ngOnInit() {

    this.textMenNue=this.translate.instant('app-chat-group.mensajes nuevos');
  }

  onAjusteClick(event: MouseEvent) {
    event.stopPropagation(); // <- Para evitar que el clic propague y dispare la navegación
    this.ajusteClick.emit(this.chatId);
  }

  
  

}
