import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigIconPickerComponent } from './config-icon-picker.component';

describe('ConfigIconPickerComponent', () => {
  let component: ConfigIconPickerComponent;
  let fixture: ComponentFixture<ConfigIconPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigIconPickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigIconPickerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
