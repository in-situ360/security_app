import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ParticipatsPermissionsListPage } from './participats-permissions-list.page';

describe('ParticipatsPermissionsListPage', () => {
  let component: ParticipatsPermissionsListPage;
  let fixture: ComponentFixture<ParticipatsPermissionsListPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ParticipatsPermissionsListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ParticipatsPermissionsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
