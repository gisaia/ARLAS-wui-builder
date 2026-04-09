import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { mockCollectionService } from '@app/test/collection.service.mock';
import { mockDialogRef } from '@app/test/mat-dialog-ref.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { WIDGET_TYPE } from '../edit-group/models';
import { EditWidgetDialogComponent } from './edit-widget-dialog.component';

describe('EditWidgetDialogComponent', () => {
    let component: EditWidgetDialogComponent;
    let fixture: ComponentFixture<EditWidgetDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                EditWidgetDialogComponent,
                LoggerModule.forRoot(null),
                ColorGeneratorModule.forRoot({
                    loader: {
                        provide: ColorGeneratorLoader,
                        useClass: AwcColorGeneratorLoader
                    }
                }),
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
                        widgetType: WIDGET_TYPE.donut,
                        formData: {},
                        collection: ''
                    }
                },
                {
                    provide: CollectionService,
                    useValue: mockCollectionService
                }
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(EditWidgetDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
