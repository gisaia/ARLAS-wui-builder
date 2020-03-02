import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { ConfigElementComponent } from './config-element.component';
import { FormGroupDirective } from '@angular/forms';

describe('ConfigElementComponent', () => {
  let spectator: Spectator<ConfigElementComponent>;

  const createComponent = createComponentFactory({
    component: ConfigElementComponent,
    providers: [FormGroupDirective]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should contain a map card', () => {
    expect(spectator.queryAll('mat-card')).toBeDefined();
  });

});
