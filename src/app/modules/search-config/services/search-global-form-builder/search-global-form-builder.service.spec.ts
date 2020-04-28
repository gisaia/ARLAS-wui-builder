import { SearchGlobalFormBuilderService } from './search-global-form-builder.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe('SearchGlobalFormBuilderService', () => {
  let spectator: SpectatorService<SearchGlobalFormBuilderService>;

  const createService = createServiceFactory({
    service: SearchGlobalFormBuilderService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
