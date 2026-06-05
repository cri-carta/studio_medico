import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizzaPiano } from './visualizza-piano';

describe('VisualizzaPiano', () => {
  let component: VisualizzaPiano;
  let fixture: ComponentFixture<VisualizzaPiano>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizzaPiano]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualizzaPiano);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
