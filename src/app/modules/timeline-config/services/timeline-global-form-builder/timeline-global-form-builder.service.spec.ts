import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { TimelineGlobalFormBuilderService } from './timeline-global-form-builder.service';
import { CollectionService } from '@services/collection-service/collection.service';
import { ArlasColorGeneratorLoader, ArlasToolkitSharedModule } from 'arlas-wui-toolkit';
import { StartupService } from '@services/startup/startup.service';
import { ArlasColorService } from 'arlas-web-components';

describe('TimelineGlobalFormBuilderService', () => {
  let spectator: SpectatorService<TimelineGlobalFormBuilderService>;

  const createService = createServiceFactory({
    service: TimelineGlobalFormBuilderService,
    imports: [ArlasToolkitSharedModule],
    providers: [
      mockProvider(CollectionService),
      mockProvider(ArlasColorGeneratorLoader),
      mockProvider(ArlasColorService),
      mockProvider(StartupService)
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
