import { StartingConfigFormBuilderService } from './starting-config-form-builder.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe('StartingConfigFormBuilderService', () => {
  let spectator: SpectatorService<StartingConfigFormBuilderService>;
  const createService = createServiceFactory({
    service: StartingConfigFormBuilderService,
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
