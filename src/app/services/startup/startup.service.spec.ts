import { HttpClient } from '@angular/common/http';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { ArlasCollaborativesearchService, ArlasConfigService, ArlasStartupService } from 'arlas-wui-toolkit';
import { StartupService } from './startup.service';

describe('StartupService', () => {
  let spectator: SpectatorService<StartupService>;
  const createService = createServiceFactory({
    service: StartupService,
    mocks: [
      ArlasConfigService,
      ArlasCollaborativesearchService,
      HttpClient,
      ArlasStartupService
    ]
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
