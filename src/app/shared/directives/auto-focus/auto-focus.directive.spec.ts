import { AutoFocusDirective } from './auto-focus.directive';
import { createDirectiveFactory, SpectatorDirective } from '@ngneat/spectator';

describe('AutoFocusDirective', () => {
  let spectator: SpectatorDirective<AutoFocusDirective>;
  const createDirective = createDirectiveFactory(AutoFocusDirective);

  beforeEach(() => {
    spectator = createDirective(`<input arlasAutoFocus>`);
  });

  it('should create an instance', () => {
    expect(spectator.directive).toBeTruthy();
  });
});
