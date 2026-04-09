import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigFormGroupArray } from '@shared-models/config-form';
import { beforeEach, describe, expect, it } from 'vitest';
import { ConfigFormGroupArrayComponent } from './config-form-group-array.component';

describe('ConfigFormGroupArrayComponent', () => {
    let component: ConfigFormGroupArrayComponent;
    let fixture: ComponentFixture<ConfigFormGroupArrayComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ConfigFormGroupArrayComponent
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(ConfigFormGroupArrayComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('configFormGroupArray', new ConfigFormGroupArray([]));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
