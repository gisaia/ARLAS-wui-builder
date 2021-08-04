import { TestBed } from '@angular/core/testing';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator';
import { ArlasSettingsService } from 'arlas-wui-toolkit/services/settings/arlas.settings.service';

import { MenuService } from './menu.service';

describe('MenuService', () => {
  let spectator: SpectatorService<MenuService>;
  const createService = createServiceFactory({
    service: MenuService,
    providers: [
        mockProvider(ArlasSettingsService, {
          settings: {}
        })
    ]
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
