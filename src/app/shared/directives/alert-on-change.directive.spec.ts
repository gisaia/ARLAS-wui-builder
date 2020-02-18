import { AlertOnChangeDirective } from './alert-on-change.directive';
import { SpectatorDirective, createDirectiveFactory } from '@ngneat/spectator';

describe('AlertOnChangeDirective', () => {

  let spectator: SpectatorDirective<AlertOnChangeDirective>;
  const createDirective = createDirectiveFactory(AlertOnChangeDirective);

  beforeEach(() => {
    spectator = createDirective(`<mat-select appAlertOnChange>AlertOnChangeDirective</mat-select>`);
  });

  it('should create an instance', () => {
    expect(spectator.directive).toBeTruthy();
  });
});
