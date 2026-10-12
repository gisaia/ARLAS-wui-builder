import { TestBed } from '@angular/core/testing';
import { mockArlasStartupService } from '@app/test/arlas-startup.service.mock';
import { mockPersistenceService } from '@app/test/persistence.service.mock';
import { mockArlasSettingsService } from '@app/test/arlas-settings.service.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import {
  ArlasCollaborativesearchService,
  ArlasConfigService,
  ArlasSettingsService,
  ArlasStartupService,
  ArlasTaskService,
  GET_OPTIONS,
  PersistenceService
} from 'arlas-wui-toolkit';
import { CollectionReferenceDescriptionProperty } from 'arlas-api';
import { LoggerModule } from 'ngx-logger';
import { of, Subject } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { MainFormManagerService } from './main-form-manager.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { StartingConfigFormBuilderService } from '@services/starting-config-form-builder/starting-config-form-builder.service';
import { ResourcesConfigFormBuilderService } from '@services/resources-form-builder/resources-config-form-builder.service';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { CollectionService } from '@services/collection-service/collection.service';
import defaultValues from '../../../default.json';
import maritimeConfig from '../../../../config.json';
import maritimeMapConfig from '../../../../config.map.json';

describe('MainFormManagerService', () => {
    let service: MainFormManagerService;
    let mainFormService: MainFormService;
    let startingConfigFormBuilder: StartingConfigFormBuilderService;
    let resourcesConfigFormBuilder: ResourcesConfigFormBuilderService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
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
                ArlasTaskService,
                {
                    provide: GET_OPTIONS,
                    useValue: () => { }
                },
                {
                    provide: ArlasStartupService,
                    useValue: {
                        contributorRegistry: new Map(),
                        validateConfiguration: () => {},
                        collections: []
                    }
                },
                {
                    provide: PersistenceService,
                    useValue: mockPersistenceService
                },
                {
                    provide: ArlasSettingsService,
                    useValue: mockArlasSettingsService
                },
                {
                    provide: ArlasCollaborativesearchService,
                    useValue: {
                        describe: () => of({ params: {} }),
                        setFetchOptions: () => {},
                        exploreApi: { describe: () => of({ params: {} }) },
                        collaborations: new Map(),
                        dataModel: {},
                        defaultCollection: 'courses',
                        colorService: {},
                        register: () => {},
                        unregister: () => {},
                        registerCollections: () => {},
                        collaborationBus: new Subject(),
                        ongoingSubscribe: new Subject(),
                        resolveButNotComputation: () => of({}),
                        resolveCompute: () => of({}),
                        resolveButNotFilter: () => of({}),
                        resolveButNotAggregation: () => of({}),
                        resolveButNotHits: () => of({ total: 0, hits: [] }),
                        contribFilterBus: new Subject(),
                        registry: new Map()
                    }
                }
            ]
        });

        service = TestBed.inject(MainFormManagerService);
        mainFormService = TestBed.inject(MainFormService);
        startingConfigFormBuilder = TestBed.inject(StartingConfigFormBuilderService);
        resourcesConfigFormBuilder = TestBed.inject(ResourcesConfigFormBuilderService);

        const defaultValuesService = TestBed.inject(DefaultValuesService);
        defaultValuesService.setConfig(defaultValues);

        const arlasConfigService = TestBed.inject(ArlasConfigService);
        arlasConfigService.setConfig(maritimeConfig);

        const collectionService = TestBed.inject(CollectionService);
        collectionService.getCollectionFields = () => of([
            { name: 'track.timestamps.center', type: CollectionReferenceDescriptionProperty.TypeEnum.DATE } as any
        ]);
        collectionService.getDescribe = () => of({ params: {} } as any);
        collectionService.collectionParamsMap.set('courses', {
            params: {
                centroid_path: 'track.location',
                timestamp_path: 'track.timestamps.center',
                id_path: 'track.id'
            }
        } as any);

        mainFormService.startingConfig.init(startingConfigFormBuilder.build());
        mainFormService.resourcesConfig.init(resourcesConfigFormBuilder.build());
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should successfully import generated maritime configuration without error', () => {
        expect(() => {
            service.doImport(structuredClone(maritimeConfig) as any, structuredClone(maritimeMapConfig) as any);
        });
    });

    it('should successfully import AND re-export (round-trip process) without error and fill inputs correctly', () => {
        service.doImport(structuredClone(maritimeConfig) as any, structuredClone(maritimeMapConfig) as any);
        const { generatedConfig, generatedMapConfig } = service.exportConfig();
        expect(generatedConfig).toBeDefined();
        expect(generatedConfig.arlas).toBeDefined();
        expect(generatedConfig.arlas.web.contributors.length).toBeGreaterThan(0);
        expect(generatedConfig.arlas.web.components.mapgl).toBeDefined();
        expect(generatedMapConfig).toBeDefined();
        expect(generatedMapConfig.layers).toBeDefined();
    });

    it('should handle edge case: missing visualisations_sets and basemapStyles without error', () => {
        const config = structuredClone(maritimeConfig) as any;
        delete config.arlas.web.components.mapgl.input.visualisations_sets;
        delete config.arlas.web.components.mapgl.input.basemapStyles;

        expect(() => {
            service.doImport(config, structuredClone(maritimeMapConfig) as any);
        });
    });

    it('should handle edge case: missing initCenter and initZoom without error', () => {
        const config = structuredClone(maritimeConfig) as any;
        delete config.arlas.web.components.mapgl.input.initCenter;
        delete config.arlas.web.components.mapgl.input.initZoom;

        expect(() => {
            service.doImport(config, structuredClone(maritimeMapConfig) as any);
        });
    });

    it('should handle edge case: missing geo_query_op on map contributor without error', () => {
        const config = structuredClone(maritimeConfig) as any;
        const mapContrib = config.arlas.web.contributors.find((c: any) => c.type === 'map');
        if (mapContrib) {
            delete mapContrib.geo_query_op;
        }

        expect(() => {
            service.doImport(config, structuredClone(maritimeMapConfig) as any);
        });
    });

    it('should handle edge case: legacy layer IDs without arlas_id prefix without error', () => {
        const config = structuredClone(maritimeConfig) as any;
        const mapConfig = structuredClone(maritimeMapConfig) as any;

        const mapContrib = config.arlas.web.contributors.find((c: any) => c.type === 'map');
        if (mapContrib && mapContrib.layers_sources) {
            mapContrib.layers_sources.forEach((ls: any) => {
                ls.id = 'legacy_layer_id';
            });
        }
        if (mapConfig.layers && mapConfig.layers.length > 0) {
            mapConfig.layers[0].id = 'legacy_layer_id';
        }

        expect(() => {
            service.doImport(config, mapConfig);
        });
    });

    it('should correctly import and re-export swimlane widget with matching canonical ID', () => {
        const config = structuredClone(maritimeConfig) as any;
        const mapConfig = structuredClone(maritimeMapConfig) as any;

        const swimlaneContrib = config.arlas.web.contributors.find((c: any) => c.type === 'swimlane');
        expect(swimlaneContrib).toBeDefined();

        service.doImport(config, mapConfig);
        const { generatedConfig } = service.exportConfig();

        const exportedSwimlane = generatedConfig.arlas.web.contributors.find((c: any) => c.type === 'swimlane');
        expect(exportedSwimlane).toBeDefined();
        expect(exportedSwimlane.identifier).toBe(swimlaneContrib.identifier);
    });
});
