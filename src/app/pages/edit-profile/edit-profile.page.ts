import { Component, OnInit } from '@angular/core';
import { RangeValue } from '@ionic/core';

interface CustomRangeValue {
  lower: number;
  upper: number;
}

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  rangeValue: CustomRangeValue = { lower: 460, upper: 750 };

  constructor() { }

  ngOnInit() { }

  onIonChange(ev: Event) {
    const customEvent = ev as CustomEvent<{ value: RangeValue }>;
    const detail = customEvent.detail;
    if (typeof detail.value === 'object' && 'lower' in detail.value && 'upper' in detail.value) {
      this.rangeValue = detail.value as CustomRangeValue;
    }
  }
}
