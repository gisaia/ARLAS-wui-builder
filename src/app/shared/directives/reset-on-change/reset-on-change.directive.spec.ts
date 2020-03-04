import { ResetOnChangeDirective } from './reset-on-change.directive';
import { SpectatorDirective, createDirectiveFactory, mockProvider } from '@ngneat/spectator';
import { DefaultValuesService } from '@services/default-values/default-values.service';

describe('ResetOnChangeDirective', () => {
  let spectator: SpectatorDirective<ResetOnChangeDirective>;
  const createDirective = createDirectiveFactory({
    directive: ResetOnChangeDirective,
    providers: [
      mockProvider(DefaultValuesService)
    ]
  });

  beforeEach(() => {
    spectator = createDirective(`<mat-select appResetOnChange>ResetOnChangeDirective</mat-select>`);
  });

  it('should create an instance', () => {
    expect(spectator.directive).toBeTruthy();
  });
});
