import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { ConfigIconPickerComponent } from './config-icon-picker.component';

describe('ConfigIconPickerComponent', () => {
  let component: ConfigIconPickerComponent;
  let fixture: ComponentFixture<ConfigIconPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ConfigIconPickerComponent,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader } })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigIconPickerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', new FormControl());
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
