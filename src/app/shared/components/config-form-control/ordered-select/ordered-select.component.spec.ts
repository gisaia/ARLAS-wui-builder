import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderedSelectComponent } from './ordered-select.component';

describe('OrderedSelectComponent', () => {
  let component: OrderedSelectComponent;
  let fixture: ComponentFixture<OrderedSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderedSelectComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OrderedSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
