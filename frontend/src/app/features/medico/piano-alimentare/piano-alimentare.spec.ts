import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PianoAlimentare } from './piano-alimentare';

describe('PianoAlimentare', () => {
  let component: PianoAlimentare;
  let fixture: ComponentFixture<PianoAlimentare>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PianoAlimentare]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PianoAlimentare);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
