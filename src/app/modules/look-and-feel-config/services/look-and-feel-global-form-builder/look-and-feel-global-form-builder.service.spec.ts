import { SpectatorService, createServiceFactory } from '@ngneat/spectator';
import { LookAndFeelGlobalFormBuilderService } from './look-and-feel-global-form-builder.service';



describe('LookAndFeelGlobalFormBuilderService', () => {
  let spectator: SpectatorService<LookAndFeelGlobalFormBuilderService>;

  const createService = createServiceFactory({
    service: LookAndFeelGlobalFormBuilderService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
