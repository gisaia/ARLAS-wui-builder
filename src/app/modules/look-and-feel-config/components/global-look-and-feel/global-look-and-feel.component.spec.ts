import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockCollectionService } from '@app/test/collection.service.mock';
import { mockMainFormService } from '@app/test/main-form.service.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { GlobalLookAndFeelComponent } from './global-look-and-feel.component';

describe('GlobalLookAndFeelComponent', () => {
    let component: GlobalLookAndFeelComponent;
    let fixture: ComponentFixture<GlobalLookAndFeelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                GlobalLookAndFeelComponent,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
                LoggerModule.forRoot(null)
            ],
            providers: [
                {
                    provide: MainFormService,
                    useValue: mockMainFormService
                },
                {
                    provide: CollectionService,
                    useValue: mockCollectionService
                }
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(GlobalLookAndFeelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
