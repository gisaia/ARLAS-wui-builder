import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { mockArlasStartupService } from '@app/test/arlas-startup.service.mock';
import { mockCollectionService } from '@app/test/collection.service.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { ArlasStartupService, ArlasTaskService, GET_OPTIONS } from 'arlas-wui-toolkit';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { EditGroupComponent } from './edit-group.component';

describe('EditGroupComponent', () => {
    let component: EditGroupComponent;
    let fixture: ComponentFixture<EditGroupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                EditGroupComponent,
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
                ArlasTaskService,
                {
                    provide: GET_OPTIONS,
                    useValue: () => { }
                },
                {
                    provide: ArlasStartupService,
                    useValue: mockArlasStartupService
                },
                {
                    provide: CollectionService,
                    useValue: mockCollectionService
                }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(EditGroupComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('formGroup', new FormGroup({
            content: new FormArray([]),
            contentType: new FormControl(),
            icon: new FormControl(),
            itemPerLine: new FormControl(),
            preview: new FormControl(),
            title: new FormControl()
        }));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
