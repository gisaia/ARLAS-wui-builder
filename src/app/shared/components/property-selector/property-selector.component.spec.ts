import { PropertySelectorComponent } from './property-selector.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';
import { ColorPickerWrapperComponent } from '@shared-components/color-picker-wrapper/color-picker-wrapper.component';
import { ArlasCollaborativesearchService, ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { Subject } from 'rxjs';
import { PROPERTY_SELECTOR_SOURCE } from './models';

describe('PropertySelectorComponent', () => {
  let spectator: Spectator<PropertySelectorComponent>;

  const createComponent = createComponentFactory({
    component: PropertySelectorComponent,
    declarations: [
      ResetOnChangeDirective,
      ColorPickerWrapperComponent
    ],
    mocks: [
      ArlasCollaborativesearchService,
      ArlasColorGeneratorLoader
    ]
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        submit: new Subject<void>().asObservable(),
        sources: Object.values(PROPERTY_SELECTOR_SOURCE)
      }

    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
