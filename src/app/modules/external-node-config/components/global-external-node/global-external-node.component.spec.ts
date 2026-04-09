import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockArlasSettingsService } from '@app/test/arlas-settings.service.mock';
import { mockMainFormService } from '@app/test/main-form.service.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { ArlasSettingsService } from 'arlas-wui-toolkit';
import { beforeEach, describe, expect, it } from 'vitest';
import { GlobalExternalNodeComponent } from './global-external-node.component';

describe('GlobalExternalNodeComponent', () => {
    let component: GlobalExternalNodeComponent;
    let fixture: ComponentFixture<GlobalExternalNodeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                GlobalExternalNodeComponent,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ],
            providers: [
                {
                    provide: MainFormService,
                    useValue: mockMainFormService
                },
                {
                    provide: ArlasSettingsService,
                    useValue: mockArlasSettingsService
                }
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(GlobalExternalNodeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
