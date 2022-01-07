import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator';
import { ArlasConfigurationDescriptor } from 'arlas-wui-toolkit';
import { SideModulesGlobalFormBuilderService } from './side-modules-global-form-builder.service';

describe('SideModulesGlobalFormBuilderService', () => {
  let spectator: SpectatorService<SideModulesGlobalFormBuilderService>;

  const createService = createServiceFactory({
    service: SideModulesGlobalFormBuilderService,
    providers: [
      mockProvider(ArlasConfigurationDescriptor)
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
