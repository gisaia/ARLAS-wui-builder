import { SearchInitService } from './search-init.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe('SearchInitService', () => {
  let spectator: SpectatorService<SearchInitService>;

  const createService = createServiceFactory({
    service: SearchInitService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
