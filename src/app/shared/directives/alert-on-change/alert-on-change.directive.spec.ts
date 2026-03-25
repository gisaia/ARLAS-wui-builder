import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { AlertOnChangeDirective } from './alert-on-change.directive';

@Component({
  imports: [AlertOnChangeDirective, MatSelectModule],
  template: `
    <mat-select arlasAlertOnChange>AlertOnChangeDirective</mat-select>
  `,
})
class Test {}

describe('AlertOnChangeDirective', () => {
  let fixture: ComponentFixture<Test>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateNoOpLoader
          }
        })
      ]
    });
    fixture = TestBed.createComponent(Test);
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const elements = fixture.debugElement.queryAll(By.directive(AlertOnChangeDirective));
    expect(elements.length).toEqual(1);
  });
});
