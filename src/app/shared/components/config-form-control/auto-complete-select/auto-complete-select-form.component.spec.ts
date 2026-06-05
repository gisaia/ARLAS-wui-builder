import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AutoCompleteSelectFormComponent} from './auto-complete-select-form.component';
import {beforeEach, describe, expect, it} from 'vitest';
import {TranslateLoader, TranslateModule, TranslateNoOpLoader} from '@ngx-translate/core';
import {IconFormControl} from '@shared-models/config-form';
import {LoggerModule, NgxLoggerLevel} from 'ngx-logger';

describe('AutoCompleteSelectComponent', () => {
  let component: AutoCompleteSelectFormComponent;
  let fixture: ComponentFixture<AutoCompleteSelectFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoCompleteSelectFormComponent,
        LoggerModule.forRoot({
          level: NgxLoggerLevel.DEBUG,
          serverLogLevel: NgxLoggerLevel.ERROR,
        }),
        TranslateModule.forRoot({loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }})
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AutoCompleteSelectFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', new IconFormControl('', '', ''));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
