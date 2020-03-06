import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { StartupService } from './startup.service';
import { ArlasConfigService, ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { HttpClient } from '@angular/common/http';
import { TranslateService, TranslateModule, TranslateFakeLoader, TranslateLoader } from '@ngx-translate/core';

describe('StartupService', () => {
  let spectator: SpectatorService<StartupService>;
  const createService = createServiceFactory({
    service: StartupService,
    imports: [
      TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } })
    ],
    providers: [
      mockProvider(ArlasConfigService),
      mockProvider(ArlasCollaborativesearchService),
      mockProvider(HttpClient),
      TranslateService
    ]
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
