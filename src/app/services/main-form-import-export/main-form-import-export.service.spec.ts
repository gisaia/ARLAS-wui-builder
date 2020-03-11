import { MainFormImportExportService } from './main-form-import-export.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe('MainFormImportExportService', () => {
  let spectator: SpectatorService<MainFormImportExportService>;
  const createService = createServiceFactory({
    service: MainFormImportExportService
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
