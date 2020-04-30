import { MainFormInitializedGuard } from './main-form-initialized.guard';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';

describe('MainFormInitializedGuard', () => {
  let spectator: SpectatorService<MainFormInitializedGuard>;
  const createComponent = createServiceFactory({
    service: MainFormInitializedGuard,
    providers: [
      mockProvider(MainFormService)
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
