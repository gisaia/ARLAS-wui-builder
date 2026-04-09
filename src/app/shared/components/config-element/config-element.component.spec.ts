import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroupDirective } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { ConfigElementComponent } from './config-element.component';

describe('ConfigElementComponent', () => {
    let component: ConfigElementComponent;
    let fixture: ComponentFixture<ConfigElementComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ConfigElementComponent
            ],
            providers: [
                FormGroupDirective
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(ConfigElementComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
