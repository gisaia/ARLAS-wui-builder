import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { EditHybridResultlistColumnsComponent } from './edit-hybrid-resultlist-columns.component';

describe('EditResultlistColumnsComponent', () => {
    let component: EditHybridResultlistColumnsComponent;
    let fixture: ComponentFixture<EditHybridResultlistColumnsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                EditHybridResultlistColumnsComponent,
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
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(EditHybridResultlistColumnsComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('control', new FormArray([]));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
