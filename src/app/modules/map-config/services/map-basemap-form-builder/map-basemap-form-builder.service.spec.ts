import { TestBed } from '@angular/core/testing';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { MapBasemapFormBuilderService } from './map-basemap-form-builder.service';

describe('MapBasemapFormBuilderService', () => {
    let service: MapBasemapFormBuilderService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                LoggerModule.forRoot(null)
            ]
        });

        service = TestBed.inject(MapBasemapFormBuilderService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
