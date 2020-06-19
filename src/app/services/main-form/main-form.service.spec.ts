import { MainFormService } from './main-form.service';
import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';

describe('MainFormService', () => {
  let spectator: SpectatorService<MainFormService>;
  const createService = createServiceFactory({
    service: MainFormService,
  });

  beforeEach(() => spectator = createService());

  it('should be defined', () => {
    expect(spectator.service).toBeDefined();
  });
});
