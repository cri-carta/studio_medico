import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedaPazienteComponent } from './scheda-paziente';

describe('SchedaPaziente', () => {
  let component: SchedaPazienteComponent;
  let fixture: ComponentFixture<SchedaPazienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchedaPazienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedaPazienteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
