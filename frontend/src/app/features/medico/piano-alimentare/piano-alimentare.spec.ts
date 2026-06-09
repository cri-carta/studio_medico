import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PianoAlimentareComponent } from './piano-alimentare';

describe('PianoAlimentare', () => {
  let component: PianoAlimentareComponent;
  let fixture: ComponentFixture<PianoAlimentareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PianoAlimentareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PianoAlimentareComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
