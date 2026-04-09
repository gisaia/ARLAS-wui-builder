import { SubTableFormGroup } from '@analytics-config/services/metrics-table-form-builder/metrics-table-form-builder.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { mockCollectionService } from '@app/test/collection.service.mock';
import { mockDialogRef } from '@app/test/mat-dialog-ref.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { LoggerModule } from 'ngx-logger';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { AddSubtableDialogComponent } from './add-subtable-dialog.component';

describe('AddSubtableDialogComponent', () => {
    let component: AddSubtableDialogComponent;
    let fixture: ComponentFixture<AddSubtableDialogComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                AddSubtableDialogComponent,
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        subTable: new SubTableFormGroup('', mockCollectionService as unknown as CollectionService, of([])),
                        collection: ''
                    }
                },
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef
                },
                {
                    provide: CollectionService,
                    useValue: mockCollectionService
                }
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(AddSubtableDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
