import { Component, OnInit } from '@angular/core';

import { RangeCustomEvent } from '@ionic/angular';
import { RangeValue } from '@ionic/core';

@Component({
  selector: 'app-highlight-profile',
  templateUrl: './highlight-profile.page.html',
  styleUrls: ['./highlight-profile.page.scss'],
})

export class HighlightProfilePage {
  lastEmittedValue: RangeValue;

  onIonChange(ev: Event) {
    this.lastEmittedValue = (ev as RangeCustomEvent).detail.value;
  }
}
