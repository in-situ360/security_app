import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectAdvertisementoptionsModalPage } from './select-advertisementoptions-modal.page';

describe('SelectAdvertisementoptionsModalPage', () => {
  let component: SelectAdvertisementoptionsModalPage;
  let fixture: ComponentFixture<SelectAdvertisementoptionsModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectAdvertisementoptionsModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectAdvertisementoptionsModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
