import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { ArlasCollaborativesearchService, ArlasStartupService,
  getOptionsFactory, GET_OPTIONS, AuthentificationService,
  ArlasConfigurationDescriptor, ArlasSettingsService, PersistenceService } from 'arlas-wui-toolkit';
import { MainFormManagerService } from './main-form-manager.service';
import { ArlasColorService } from 'arlas-web-components';

describe('MainFormManagerService', () => {
  let spectator: SpectatorService<MainFormManagerService>;
  const createService = createServiceFactory({
    service: MainFormManagerService,
    providers: [
      mockProvider(CollectionService),
      mockProvider(ArlasStartupService),
      mockProvider(ArlasCollaborativesearchService),
      mockProvider(ArlasColorService),
      mockProvider(PersistenceService),
      mockProvider(ArlasSettingsService, {
        getAuthentSettings: () => undefined
      }),
      mockProvider(ArlasConfigurationDescriptor),
      mockProvider(AuthentificationService),
      mockProvider(CollectionService),
      {
        provide: GET_OPTIONS,
        useFactory: getOptionsFactory,
        deps: [AuthentificationService]
      }    ]
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
