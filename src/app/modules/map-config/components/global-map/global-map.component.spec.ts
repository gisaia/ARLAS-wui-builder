import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockMainFormService } from '@app/test/main-form.service.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { GlobalMapComponent } from './global-map.component';

describe('GlobalMapComponent', () => {
    let component: GlobalMapComponent;
    let fixture: ComponentFixture<GlobalMapComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                GlobalMapComponent,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
                LoggerModule.forRoot(null)
            ],
            providers: [
                {
                    provide: MainFormService,
                    useValue: mockMainFormService
                }
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(GlobalMapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
