import { ColorPickerWrapperComponent } from './color-picker-wrapper.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';

describe('ColorPickerComponent', () => {
  let spectator: Spectator<ColorPickerWrapperComponent>;

  const createComponent = createComponentFactory({
    component: ColorPickerWrapperComponent
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should contain a color picker input', () => {
    expect(spectator.queryAll('ngx-color-picker')).toBeDefined();
  });
});
