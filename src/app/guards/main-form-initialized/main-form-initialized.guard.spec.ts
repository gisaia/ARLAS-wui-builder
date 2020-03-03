import { MainFormInitializedGuard } from './main-form-initialized.guard';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe('MainFormInitializedGuard', () => {
  let spectator: SpectatorService<MainFormInitializedGuard>;
  const createComponent = createServiceFactory({
    service: MainFormInitializedGuard
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
