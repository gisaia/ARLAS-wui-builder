import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoCompleteSelectFormComponent } from './auto-complete-select-form.component';

describe('AutoCompleteSelectComponent', () => {
  let component: AutoCompleteSelectFormComponent;
  let fixture: ComponentFixture<AutoCompleteSelectFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoCompleteSelectFormComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AutoCompleteSelectFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
