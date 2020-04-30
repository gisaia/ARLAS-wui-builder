import { AnalyticsInitService } from './analytics-init.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { ArlasStartupService, ArlasCollaborativesearchService } from 'arlas-wui-toolkit';

describe('AnalyticsInitService', () => {
  let spectator: SpectatorService<AnalyticsInitService>;

  const createService = createServiceFactory({
    service: AnalyticsInitService,
    providers: [
      mockProvider(ArlasStartupService),
      mockProvider(ArlasCollaborativesearchService),
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
