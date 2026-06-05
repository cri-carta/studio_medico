import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPaziente } from './dashboard-paziente';

describe('DashboardPaziente', () => {
  let component: DashboardPaziente;
  let fixture: ComponentFixture<DashboardPaziente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPaziente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPaziente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
