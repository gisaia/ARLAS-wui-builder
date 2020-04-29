import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { GET_OPTIONS } from '@services/persistence/persistence.service';
import { PersistenceService } from './persistence.service';

describe('PersistenceService', () => {
  let spectator: SpectatorService<PersistenceService>;
  const createService = createServiceFactory({
    service: PersistenceService,
    providers: [
      {provide: GET_OPTIONS, useValue: {}}
    ]
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
