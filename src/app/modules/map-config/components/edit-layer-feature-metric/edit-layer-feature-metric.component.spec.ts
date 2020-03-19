import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayerFeatureMetricComponent } from './edit-layer-feature-metric.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { Subject } from 'rxjs';
import { EditLayerModeFormComponent } from '../edit-layer-mode-form/edit-layer-mode-form.component';
import { MockComponent } from 'ng-mocks';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { FormGroup } from '@angular/forms';

describe('EditLayerFeatureMetricComponent', () => {
  let spectator: Spectator<EditLayerFeatureMetricComponent>;
  const createComponent = createComponentFactory({
    component: EditLayerFeatureMetricComponent,
    declarations: [
      MockComponent(EditLayerModeFormComponent),
      MockComponent(ConfigElementComponent)
    ]
  });

  beforeEach(() => spectator = createComponent({
    props: {
      submit: new Subject<void>().asObservable(),
      embeddedFeaturesComponent: {
        formFg: new FormGroup({
          geometryStep: new FormGroup({})
        })
      } as EditLayerModeFormComponent
    }
  }));

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
