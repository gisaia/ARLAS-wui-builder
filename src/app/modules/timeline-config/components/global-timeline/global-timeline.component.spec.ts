import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockCollectionService } from '@app/test/collection.service.mock';
import { mockMainFormService } from '@app/test/main-form.service.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { GlobalTimelineComponent } from './global-timeline.component';

describe('GlobalTimelineComponent', () => {
    let component: GlobalTimelineComponent;
    let fixture: ComponentFixture<GlobalTimelineComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                GlobalTimelineComponent,
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

        fixture = TestBed.createComponent(GlobalTimelineComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
