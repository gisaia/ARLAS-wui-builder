import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { OrderedSelectComponent } from './ordered-select.component';
import {TranslateLoader, TranslateModule, TranslateNoOpLoader} from '@ngx-translate/core';
import {IconFormControl} from '@shared-models/config-form';

describe('OrderedSelectComponent', () => {
  let component: OrderedSelectComponent;
  let fixture: ComponentFixture<OrderedSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderedSelectComponent, TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
      }),]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OrderedSelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', new IconFormControl('', '', ''));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
