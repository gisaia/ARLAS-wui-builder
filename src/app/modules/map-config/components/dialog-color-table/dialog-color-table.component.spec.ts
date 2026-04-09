import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { mockDialogRef } from '@app/test/mat-dialog-ref.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { DialogColorTableComponent } from './dialog-color-table.component';

describe('DialogColorTableComponent', () => {
    let component: DialogColorTableComponent;
    let fixture: ComponentFixture<DialogColorTableComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                DialogColorTableComponent,
                ColorGeneratorModule.forRoot({
                    loader: {
                        provide: ColorGeneratorLoader,
                        useClass: AwcColorGeneratorLoader
                    }
                }),
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        collection: 'Test',
                        sourceField: 'Test',
                        keywordColors: []
                    }
                }
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(DialogColorTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
