import { SpectatorDirective, createDirectiveFactory } from '@ngneat/spectator';
import { DefaultValuesService } from '../../../services/default-values/default-values.service';
import { ResetOnChangeDirective } from './reset-on-change.directive';

describe('ResetOnChangeDirective', () => {
  let spectator: SpectatorDirective<ResetOnChangeDirective>;
  const createDirective = createDirectiveFactory({
    directive: ResetOnChangeDirective,
    mocks: [
      DefaultValuesService
    ]
  });

  beforeEach(() => {
    spectator = createDirective(`<mat-select arlasResetOnChange>ResetOnChangeDirective</mat-select>`);
  });

  it('should create an instance', () => {
    expect(spectator.directive).toBeTruthy();
  });
});
