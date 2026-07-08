import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { mockCollectionService } from '@app/test/collection.service.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { ResultlistDataComponent } from './resultlist-data.component';

describe('ResultlistDataComponent', () => {
    let component: ResultlistDataComponent;
    let fixture: ComponentFixture<ResultlistDataComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ResultlistDataComponent,
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
                FormGroupDirective,
                {
                    provide: CollectionService,
                    useValue: mockCollectionService
                }
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(ResultlistDataComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('control', new FormGroup({
            collection: new FormControl(),
            columns: new FormArray([]),
            details: new FormArray([]),
            grid: new FormGroup({})
        }));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
