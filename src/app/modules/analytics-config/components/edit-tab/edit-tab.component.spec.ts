import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { EditTabComponent } from './edit-tab.component';

describe('EditTabComponent', () => {
    let component: EditTabComponent;
    let fixture: ComponentFixture<EditTabComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                EditTabComponent,
                TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader } })
            ],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        icon: 'close',
                        name: 'test',
                        showIcon: true,
                        showName: false
                    }
                }
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(EditTabComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
