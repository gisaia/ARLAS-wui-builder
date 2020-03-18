import { LayersComponent } from './layers.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';
import { FormArray } from '@angular/forms';

describe('LayersComponent', () => {
  let spectator: Spectator<LayersComponent>;
  const createComponent = createComponentFactory({
    component: LayersComponent
  });

  beforeEach(() => spectator = createComponent());

  it('should be loaded successfully', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should contain a table', () => {
    expect(spectator.queryAll('table')).toBeDefined();
  });
});
