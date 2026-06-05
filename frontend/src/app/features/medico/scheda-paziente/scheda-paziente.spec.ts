import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedaPaziente } from './scheda-paziente';

describe('SchedaPaziente', () => {
  let component: SchedaPaziente;
  let fixture: ComponentFixture<SchedaPaziente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchedaPaziente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedaPaziente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
