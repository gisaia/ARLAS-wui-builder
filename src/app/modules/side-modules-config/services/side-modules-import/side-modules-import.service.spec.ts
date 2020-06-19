import { SideModulesImportService } from './side-modules-import.service';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';

describe('SideModulesImportService', () => {
  let spectator: SpectatorService<SideModulesImportService>;

  const createService = createServiceFactory({
    service: SideModulesImportService,
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
