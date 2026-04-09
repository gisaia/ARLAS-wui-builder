import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { EditResultlistDetailsComponent } from './edit-resultlist-details.component';

describe('EditResultlistDetailsComponent', () => {
    let component: EditResultlistDetailsComponent;
    let fixture: ComponentFixture<EditResultlistDetailsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                EditResultlistDetailsComponent,
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

        fixture = TestBed.createComponent(EditResultlistDetailsComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('control', new FormArray([]));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
