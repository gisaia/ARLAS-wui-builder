import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { ArlasCollaborativesearchService, ArlasStartupService, ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { MainFormManagerService } from './main-form-manager.service';
import { ArlasConfigurationDescriptor } from 'arlas-wui-toolkit/services/configuration-descriptor/configurationDescriptor.service';
import { AuthentificationService } from 'arlas-wui-toolkit/services/authentification/authentification.service';
import { GET_OPTIONS } from 'arlas-wui-toolkit/services/persistence/persistence.service';
import { getOptionsFactory } from 'arlas-wui-toolkit/app.module';

describe('MainFormManagerService', () => {
  let spectator: SpectatorService<MainFormManagerService>;
  const createService = createServiceFactory({
    service: MainFormManagerService,
    providers: [
      mockProvider(CollectionService),
      mockProvider(ArlasStartupService),
      mockProvider(ArlasCollaborativesearchService),
      mockProvider(ArlasColorGeneratorLoader),
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
