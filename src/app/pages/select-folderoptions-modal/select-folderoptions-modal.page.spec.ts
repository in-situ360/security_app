import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectFolderoptionsModalPage } from './select-folderoptions-modal.page';

describe('SelectFolderoptionsModalPage', () => {
  let component: SelectFolderoptionsModalPage;
  let fixture: ComponentFixture<SelectFolderoptionsModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectFolderoptionsModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectFolderoptionsModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
