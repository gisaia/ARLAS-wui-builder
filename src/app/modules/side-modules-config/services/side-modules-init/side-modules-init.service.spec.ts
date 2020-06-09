import { SideModulesInitService } from './side-modules-init.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { SideModulesGlobalFormBuilderService } from '../side-modules-global-form-builder/side-modules-global-form-builder.service';

describe('SideModulesInitService', () => {
  let spectator: SpectatorService<SideModulesInitService>;

  const createService = createServiceFactory({
    service: SideModulesInitService,
    providers: [
      mockProvider(SideModulesGlobalFormBuilderService)
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
