import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { AutoFocusDirective } from './auto-focus.directive';

@Component({
    imports: [AutoFocusDirective],
    template: `
        <input [arlasAutoFocus]="true">
    `
})
class Test {
}

describe('AutoFocusDirective', () => {
    let fixture: ComponentFixture<Test>;

    beforeEach(() => {
        fixture = TestBed.createComponent(Test);
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        const elements = fixture.debugElement.queryAll(By.directive(AutoFocusDirective));
        expect(elements.length).toEqual(1);
    });
});
