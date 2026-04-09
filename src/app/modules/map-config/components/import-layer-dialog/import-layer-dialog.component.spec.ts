import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { GET_OPTIONS } from 'arlas-wui-toolkit';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { ImportLayerDialogComponent } from './import-layer-dialog.component';

describe('ImportLayerDialogComponent', () => {
    let component: ImportLayerDialogComponent;
    let fixture: ComponentFixture<ImportLayerDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ImportLayerDialogComponent,
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                })
            ],
            providers: [
                {
                    provide: GET_OPTIONS,
                    useValue: () => {}
                }
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(ImportLayerDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
