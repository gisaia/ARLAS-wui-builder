import { SideModulesGlobalFormBuilderService } from './side-modules-global-form-builder.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { ArlasConfigurationDescriptor } from 'arlas-wui-toolkit/services/configuration-descriptor/configurationDescriptor.service';

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
