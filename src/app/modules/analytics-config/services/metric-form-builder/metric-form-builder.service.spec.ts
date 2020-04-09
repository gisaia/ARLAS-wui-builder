import { MetricFormBuilderService } from './metric-form-builder.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe('MetricFormBuilderService', () => {
  let spectator: SpectatorService<MetricFormBuilderService>;

  const createService = createServiceFactory({
    service: MetricFormBuilderService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
