import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ColorPickerWrapperComponent } from './color-picker-wrapper.component';

describe('ColorPickerWrapperComponent', () => {
    let component: ColorPickerWrapperComponent;
    let fixture: ComponentFixture<ColorPickerWrapperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ColorPickerWrapperComponent,
                LoggerModule.forRoot(null)
            ],
            providers: [
                {
                    provide: DefaultValuesService,
                    useValue: {
                        getDefaultConfig: vi.fn(() => ({ colorPickerPresets: []}))
                    }
                }
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(ColorPickerWrapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
