import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mockArlasStartupService } from '@app/test/arlas-startup.service.mock';
import { mockCollectionService } from '@app/test/collection.service.mock';
import { mockPersistenceService } from '@app/test/persistence.service.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { BasemapService } from 'arlas-map';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { ArlasStartupService, ArlasTaskService, GET_OPTIONS, PersistenceService } from 'arlas-wui-toolkit';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PreviewComponent } from './preview.component';

describe('PreviewComponent', () => {
    let component: PreviewComponent;
    let fixture: ComponentFixture<PreviewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                PreviewComponent,
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
                },
                {
                    provide: PersistenceService,
                    useValue: mockPersistenceService
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        mapglContributors: [],
                        mapComponentConfig: {
                            allowMapExtend: true,
                            input: {
                                basemapStyles: []
                            }
                        }
                    }
                },
                {
                    provide: BasemapService,
                    useValue: {
                        protomapBasemapAdded$: of(),
                        setBasemaps: vi.fn(() => { }),
                        fetchSources$: vi.fn(() => of([])),
                        basemapChanged$: of()
                    }
                }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PreviewComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('mapComponentConfig', {
            basemapStyles: [],
            mapLayers: {
                layers: [],
                externalEventLayers: [],
                events: {
                    onHover: new Set(),
                    emitOnClick: new Set(),
                    zoomOnClick: new Set()
                }
            },
            visualisations_sets: []
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
