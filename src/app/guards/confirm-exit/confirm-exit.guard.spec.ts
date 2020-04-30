import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { ConfirmExitGuard } from './confirm-exit.guard';

describe('ConfirmExitGuard', () => {
  let spectator: SpectatorService<ConfirmExitGuard>;
  const createComponent = createServiceFactory({
    service: ConfirmExitGuard
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });

});
