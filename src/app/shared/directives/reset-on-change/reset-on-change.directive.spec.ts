import { beforeEach, describe, expect, it } from "vitest";
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { mockProvider } from '@ngneat/spectator';
import { NGXLogger } from 'ngx-logger';
import { ResetOnChangeDirective } from './reset-on-change.directive';

@Component({
    imports: [ResetOnChangeDirective, MatSelectModule],
    template: `
    <mat-select arlasResetOnChange>ResetOnChangeDirective</mat-select>
  `,
})
class Test {
}

describe('ResetOnChangeDirective', () => {
    let fixture: ComponentFixture<Test>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptorsFromDi()),
                mockProvider(NGXLogger)
            ]
        });
        fixture = TestBed.createComponent(Test);
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        expect(fixture.debugElement.queryAll(By.directive(ResetOnChangeDirective)).length).toEqual(1);
    });
});
