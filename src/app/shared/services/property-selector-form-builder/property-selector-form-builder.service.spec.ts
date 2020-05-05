import { PropertySelectorFormBuilderService } from './property-selector-form-builder.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe('PropertySelectorFormBuilderService', () => {
  let spectator: SpectatorService<PropertySelectorFormBuilderService>;

  const createService = createServiceFactory({
    service: PropertySelectorFormBuilderService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
