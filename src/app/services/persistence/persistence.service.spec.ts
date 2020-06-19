import { createServiceFactory, SpectatorService, mockProvider } from '@ngneat/spectator';
import { GET_OPTIONS } from '@services/persistence/persistence.service';
import { PersistenceService } from './persistence.service';
import { AuthentificationService } from 'arlas-wui-toolkit/services/authentification/authentification.service';

describe('PersistenceService', () => {
  let spectator: SpectatorService<PersistenceService>;
  const createService = createServiceFactory({
    service: PersistenceService,
    providers: [
      {provide: GET_OPTIONS, useValue: {}},
      mockProvider(AuthentificationService)
    ]
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
