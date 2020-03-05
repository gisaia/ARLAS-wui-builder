import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { StartupService } from './startup.service';
import { ArlasConfigService, ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { HttpClient } from '@angular/common/http';

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
