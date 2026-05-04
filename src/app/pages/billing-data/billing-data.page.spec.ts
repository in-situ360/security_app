import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingDataPage } from './billing-data.page';

describe('BillingDataPage', () => {
  let component: BillingDataPage;
  let fixture: ComponentFixture<BillingDataPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingDataPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
