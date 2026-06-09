import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardMedicoComponent } from './dashboard-medico';

describe('DashboardMedico', () => {
  let component: DashboardMedicoComponent;
  let fixture: ComponentFixture<DashboardMedicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardMedicoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardMedicoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
