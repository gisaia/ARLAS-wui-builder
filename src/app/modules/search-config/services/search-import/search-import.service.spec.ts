import { SpectatorService, createServiceFactory } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';
import { SearchGlobalFormBuilderService } from '../search-global-form-builder/search-global-form-builder.service';
import { SearchImportService } from './search-import.service';

describe('SearchImportService', () => {
  let spectator: SpectatorService<SearchImportService>;

  const createService = createServiceFactory({
    service: SearchImportService,
    mocks: [
      MainFormService,
      SearchGlobalFormBuilderService
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
