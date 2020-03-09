import { HttpClient } from '@angular/common/http';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator';
import { ArlasCollaborativesearchService, ArlasConfigService } from 'arlas-wui-toolkit';
import { StartupService } from './startup.service';

describe('StartupService', () => {
  let spectator: SpectatorService<StartupService>;
  const createService = createServiceFactory({
    service: StartupService,
    providers: [
      mockProvider(ArlasConfigService),
      mockProvider(ArlasCollaborativesearchService),
      mockProvider(HttpClient)
    ]
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
