import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { TimelineImportService } from './timeline-import.service';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { CollectionService } from '@services/collection-service/collection.service';

describe('TimelineImportService', () => {
  let spectator: SpectatorService<TimelineImportService>;

  const createService = createServiceFactory({
    service: TimelineImportService,
    providers: [
      mockProvider(ArlasColorGeneratorLoader),
      mockProvider(CollectionService)
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
