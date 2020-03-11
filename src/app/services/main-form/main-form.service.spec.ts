import { MainFormService } from './main-form.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { FormGroup } from '@angular/forms';

describe('MainFormService', () => {
  let spectator: SpectatorService<MainFormService>;
  const createService = createServiceFactory({
    service: MainFormService,
    mocks: [
      FormBuilderWithDefaultService
    ]
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
