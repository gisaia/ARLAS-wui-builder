import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { mockDialogRef } from '@app/test/mat-dialog-ref.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { DialogPaletteSelectorComponent } from './dialog-palette-selector.component';

describe('DialogPaletteSelectorComponent', () => {
    let component: DialogPaletteSelectorComponent;
    let fixture: ComponentFixture<DialogPaletteSelectorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                DialogPaletteSelectorComponent,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef
                },
                { provide: MAT_DIALOG_DATA, useValue: { defaultPalettes: [], selectedPalette: '' } }
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(DialogPaletteSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
