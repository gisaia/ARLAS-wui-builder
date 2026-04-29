import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockMainFormService } from '@app/test/main-form.service.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { GlobalResultListComponent } from './global-result-list.component';

describe('GlobalResultListComponent', () => {
    let component: GlobalResultListComponent;
    let fixture: ComponentFixture<GlobalResultListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                GlobalResultListComponent,
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ],
            providers: [
                {
                    provide: MainFormService,
                    useValue: mockMainFormService
                }
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(GlobalResultListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
