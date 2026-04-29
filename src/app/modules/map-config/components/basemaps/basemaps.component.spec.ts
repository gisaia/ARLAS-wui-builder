import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockArlasSettingsService } from '@app/test/arlas-settings.service.mock';
import { mockMainFormService } from '@app/test/main-form.service.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { ArlasSettingsService } from 'arlas-wui-toolkit';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { BasemapsComponent } from './basemaps.component';

describe('BasemapsComponent', () => {
    let component: BasemapsComponent;
    let fixture: ComponentFixture<BasemapsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                BasemapsComponent,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
                LoggerModule.forRoot(null)
            ],
            providers: [
                {
                    provide: ArlasSettingsService,
                    useValue: mockArlasSettingsService
                },
                {
                    provide: MainFormService,
                    useValue: mockMainFormService
                }
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(BasemapsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
