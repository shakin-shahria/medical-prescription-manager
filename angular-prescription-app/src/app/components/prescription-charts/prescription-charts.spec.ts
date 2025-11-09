import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionCharts } from './prescription-charts';

describe('PrescriptionCharts', () => {
  let component: PrescriptionCharts;
  let fixture: ComponentFixture<PrescriptionCharts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionCharts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrescriptionCharts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
