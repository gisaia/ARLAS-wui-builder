import { beforeEach, describe, expect, it } from 'vitest';
import { MainFormManagerService } from './main-form-manager.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { findInvalidAnalytics, findInvalidControls, setupMainFormManager } from './main-form-manager.testbed';
import maritimeConfig from '../../../../config.json';
import maritimeMapConfig from '../../../../config.map.json';

describe('MainFormManagerService', () => {
    let service: MainFormManagerService;
    let mainFormService: MainFormService;

    beforeEach(() => {
        ({ service, mainFormService } = setupMainFormManager(maritimeConfig));
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should successfully import generated maritime configuration without error', () => {
        expect(() => {
            service.doImport(structuredClone(maritimeConfig) as any, structuredClone(maritimeMapConfig) as any);
        }).not.toThrow();
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
        }).not.toThrow();
    });

    it('should handle edge case: missing initCenter and initZoom without error', () => {
        const config = structuredClone(maritimeConfig) as any;
        delete config.arlas.web.components.mapgl.input.initCenter;
        delete config.arlas.web.components.mapgl.input.initZoom;

        expect(() => {
            service.doImport(config, structuredClone(maritimeMapConfig) as any);
        }).not.toThrow();
    });

    it('should handle edge case: missing geo_query_op on map contributor without error', () => {
        const config = structuredClone(maritimeConfig) as any;
        const mapContrib = config.arlas.web.contributors.find((c: any) => c.type === 'map');
        if (mapContrib) {
            delete mapContrib.geo_query_op;
        }

        expect(() => {
            service.doImport(config, structuredClone(maritimeMapConfig) as any);
        }).not.toThrow();
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
        }).not.toThrow();
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

    it('should have all analytics groups and widgets valid', () => {
        service.doImport(structuredClone(maritimeConfig) as any, structuredClone(maritimeMapConfig) as any);
        expect(findInvalidAnalytics(mainFormService)).toEqual([]);
    });

    it('should have the entire mainForm completely valid after import', () => {
        service.doImport(structuredClone(maritimeConfig) as any, structuredClone(maritimeMapConfig) as any);
        expect(findInvalidControls(mainFormService.mainForm)).toEqual([]);
    });
});
