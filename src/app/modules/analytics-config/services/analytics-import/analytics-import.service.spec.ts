import { AnalyticsImportService } from './analytics-import.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { ArlasStartupService, ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { ArlasColorService } from 'arlas-web-components';

describe('AnalyticsImportService', () => {
  let spectator: SpectatorService<AnalyticsImportService>;

  const createService = createServiceFactory({
    service: AnalyticsImportService,
    providers: [
      mockProvider(CollectionService),
      mockProvider(ArlasStartupService),
      mockProvider(ArlasCollaborativesearchService),
      mockProvider(ArlasColorService),
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
