import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigFormGroup } from '@shared-models/config-form';
import { beforeEach, describe, expect, it } from 'vitest';
import { ConfigFormGroupComponent } from './config-form-group.component';

describe('ConfigFormGroupComponent', () => {
    let component: ConfigFormGroupComponent;
    let fixture: ComponentFixture<ConfigFormGroupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ConfigFormGroupComponent
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(ConfigFormGroupComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('configFormGroup', new ConfigFormGroup({}));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
