import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayerFeatureMetricComponent } from './edit-layer-feature-metric.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { Subject } from 'rxjs';
import { EditLayerFeaturesComponent } from '../edit-layer-features/edit-layer-features.component';
import { MockComponent } from 'ng-mocks';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';

describe('EditLayerFeatureMetricComponent', () => {
  let spectator: Spectator<EditLayerFeatureMetricComponent>;
  const createComponent = createComponentFactory({
    component: EditLayerFeatureMetricComponent,
    declarations: [
      MockComponent(EditLayerFeaturesComponent),
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
      } as EditLayerFeaturesComponent
    }
  }));

  it('should create', () => {
    spectator.component.formFg = new FormGroup({
      geometryStep: new FormGroup({})
    });
    expect(spectator.component).toBeTruthy();
  });

});
