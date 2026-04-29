import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockMainFormService } from '@app/test/main-form.service.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { beforeEach, describe, expect, it } from 'vitest';
import { MetricsTableDataComponent } from './metrics-table-data.component';

describe('MetricsTableDataComponent', () => {
    let component: MetricsTableDataComponent;
    let fixture: ComponentFixture<MetricsTableDataComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MetricsTableDataComponent,
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

        fixture = TestBed.createComponent(MetricsTableDataComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
