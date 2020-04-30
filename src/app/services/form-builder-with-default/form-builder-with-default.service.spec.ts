import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { FormBuilderWithDefaultService } from './form-builder-with-default.service';
import { DefaultValuesService } from '@services/default-values/default-values.service';

describe('FormBuilderWithDefaultService', () => {
  let spectator: SpectatorService<FormBuilderWithDefaultService>;
  const createService = createServiceFactory({
    service: FormBuilderWithDefaultService,
    mocks: [
      DefaultValuesService
    ]
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
