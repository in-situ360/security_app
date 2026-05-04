import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-rating',
  templateUrl: './app-rating.component.html',
  styleUrls: ['./app-rating.component.scss'],
})
export class AppRatingComponent implements OnInit {

  @Input() rating: number;
  @Input() centered: boolean = false;
  @Input() size: string = "small";
  @Input() color: string = "primary";

  constructor() { }

  ngOnInit() {}


  round(number){
    return Math.round(number);
  }

}


