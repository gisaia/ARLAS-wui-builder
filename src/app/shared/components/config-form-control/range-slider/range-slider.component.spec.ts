import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeSliderComponent } from './range-slider.component';
import { beforeEach, describe, expect, it } from 'vitest';
import {TranslateLoader, TranslateModule, TranslateNoOpLoader} from '@ngx-translate/core';
import {IconFormControl, RangeSliderFormControl} from '@shared-models/config-form';
describe('RangeSliderComponent', () => {
  let component: RangeSliderComponent;
  let fixture: ComponentFixture<RangeSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RangeSliderComponent, TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
      })]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RangeSliderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', new RangeSliderFormControl({}, '',
        {min:'', max:''}, '0', 1, 2, 1));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
