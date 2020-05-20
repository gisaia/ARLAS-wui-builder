import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { LookAndFeelInitService } from './look-and-feel-init.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { LookAndFeelGlobalFormBuilderService } from '../look-and-feel-global-form-builder/look-and-feel-global-form-builder.service';

describe('LookAndFeelInitService', () => {
  let spectator: SpectatorService<LookAndFeelInitService>;

  const createService = createServiceFactory({
    service: LookAndFeelInitService,
    providers: [
      mockProvider(MainFormService),
      mockProvider(LookAndFeelGlobalFormBuilderService)
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
