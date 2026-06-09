import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizzaPianoComponent } from './visualizza-piano';

describe('VisualizzaPiano', () => {
  let component: VisualizzaPianoComponent;
  let fixture: ComponentFixture<VisualizzaPianoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizzaPianoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualizzaPianoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
