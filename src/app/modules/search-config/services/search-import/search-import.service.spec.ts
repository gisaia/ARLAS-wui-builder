import { SpectatorService, createServiceFactory } from '@ngneat/spectator';
import { SearchImportService } from './search-import.service';

describe('SearchImportService', () => {
  let spectator: SpectatorService<SearchImportService>;

  const createService = createServiceFactory({
    service: SearchImportService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
