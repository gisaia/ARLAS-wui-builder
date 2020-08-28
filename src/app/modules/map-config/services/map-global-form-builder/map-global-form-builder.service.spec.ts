import { MapGlobalFormBuilderService } from './map-global-form-builder.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';
import { CollectionService } from '@services/collection-service/collection.service';
import { DefaultValuesService } from '@services/default-values/default-values.service';

describe('MapGlobalFormBuilderService', () => {
  let spectator: SpectatorService<MapGlobalFormBuilderService>;

  const createService = createServiceFactory({
    service: MapGlobalFormBuilderService,
    providers: [
      mockProvider(DefaultValuesService),
      mockProvider(CollectionService),
      mockProvider(MainFormService)
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
