import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { TimelineImportService } from './timeline-import.service';
import { ArlasColorGeneratorLoader, ArlasToolkitSharedModule } from 'arlas-wui-toolkit';
import { CollectionService } from '@services/collection-service/collection.service';
import { StartupService } from '@services/startup/startup.service';
import { ArlasColorService } from 'arlas-web-components';

describe('TimelineImportService', () => {
  let spectator: SpectatorService<TimelineImportService>;

  const createService = createServiceFactory({
    service: TimelineImportService,
    imports: [ArlasToolkitSharedModule],
    providers: [
      mockProvider(ArlasColorGeneratorLoader),
      mockProvider(ArlasColorService),
      mockProvider(CollectionService),
      mockProvider(StartupService)
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
