import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { FormBuilderWithDefaultService } from './form-builder-with-default.service';
import { DefaultValuesService } from '../default-values/default-values.service';

describe('FormBuilderWithDefaultService', () => {
  let spectator: SpectatorService<FormBuilderWithDefaultService>;
  const createService = createServiceFactory({
    service: FormBuilderWithDefaultService,
    providers: [
      mockProvider(DefaultValuesService)
    ]
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
