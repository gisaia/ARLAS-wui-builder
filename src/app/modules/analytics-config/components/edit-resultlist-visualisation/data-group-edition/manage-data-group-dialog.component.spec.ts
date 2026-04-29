import { ResultListVisualisationsDataGroup } from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { ManageDataGroupDialogComponent } from './manage-data-group-dialog.component';

describe('ManageDataGroupDialogComponent', () => {
    let component: ManageDataGroupDialogComponent;
    let fixture: ComponentFixture<ManageDataGroupDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ManageDataGroupDialogComponent,
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
                ColorGeneratorModule.forRoot({
                    loader: {
                        provide: ColorGeneratorLoader,
                        useClass: AwcColorGeneratorLoader
                    }
                }),
            ],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        edit: true,
                        dataGroup: new ResultListVisualisationsDataGroup(),
                        collectionControlName: 'collection'
                    }
                }
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(ManageDataGroupDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
