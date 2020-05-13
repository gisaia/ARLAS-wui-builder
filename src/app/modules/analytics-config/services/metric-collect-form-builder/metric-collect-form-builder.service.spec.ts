import { MetricCollectFormBuilderService } from './metric-collect-form-builder.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe('MetricFormBuilderService', () => {
  let spectator: SpectatorService<MetricCollectFormBuilderService>;

  const createService = createServiceFactory({
    service: MetricCollectFormBuilderService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
