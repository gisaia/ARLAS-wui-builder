import { SearchInitService } from './search-init.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';
import { SearchGlobalFormBuilderService } from '../search-global-form-builder/search-global-form-builder.service';

describe('SearchInitService', () => {
  let spectator: SpectatorService<SearchInitService>;

  const createService = createServiceFactory({
    service: SearchInitService,
    providers: [
      mockProvider(SearchGlobalFormBuilderService)
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
