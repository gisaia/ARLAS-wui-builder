import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { GET_OPTIONS } from 'arlas-wui-toolkit';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { ImportWidgetDialogComponent } from './import-widget-dialog.component';

describe('ImportWidgetDialogComponent', () => {
    let component: ImportWidgetDialogComponent;
    let fixture: ComponentFixture<ImportWidgetDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ImportWidgetDialogComponent,
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ],
            providers: [
                {
                    provide: GET_OPTIONS,
                    useValue: () => {}
                }
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(ImportWidgetDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
