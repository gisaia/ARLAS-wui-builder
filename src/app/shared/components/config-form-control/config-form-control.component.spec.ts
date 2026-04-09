import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { IconFormControl } from '@shared-models/config-form';
import { beforeEach, describe, expect, it } from 'vitest';
import { ConfigFormControlComponent } from './config-form-control.component';

describe('ConfigFormControlComponent', () => {
    let component: ConfigFormControlComponent;
    let fixture: ComponentFixture<ConfigFormControlComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ConfigFormControlComponent,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(ConfigFormControlComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('control', new IconFormControl('', '', ''));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
