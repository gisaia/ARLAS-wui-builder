import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockMainFormService } from '@app/test/main-form.service.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { GlobalSideModulesComponent } from './global-side-modules.component';

describe('GlobalSideModulesComponent', () => {
    let component: GlobalSideModulesComponent;
    let fixture: ComponentFixture<GlobalSideModulesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                GlobalSideModulesComponent,
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

        fixture = TestBed.createComponent(GlobalSideModulesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
