import { EditLayerComponent } from './edit-layer.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { MockComponent } from 'ng-mocks';
import { Component } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { EditLayerFeaturesComponent } from '../edit-layer-features/edit-layer-features.component';
import { MainFormService } from '@services/main-form/main-form.service';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { FormArray } from '@angular/forms';
import { EditLayerFeatureMetricComponent } from '../edit-layer-feature-metric/edit-layer-feature-metric.component';
import { ObjectvaluesPipe } from '@shared/pipes/objectvalues.pipe';

@Component({ template: '' }) class DummyComponent { }

describe('EditLayerComponent', () => {
  let spectator: Spectator<EditLayerComponent>;
  const createComponent = createComponentFactory({
    component: EditLayerComponent,
    imports: [
      RouterTestingModule.withRoutes([{ path: 'map-config/layers', component: DummyComponent }])
    ],
    providers: [
      mockProvider(MainFormService, {
        mapConfig: {
          getLayersFa: () => new FormArray([])
        }
      })
    ],
    declarations: [
      DummyComponent,
      MockComponent(ConfigElementComponent),
      MockComponent(EditLayerFeaturesComponent),
      MockComponent(EditLayerFeatureMetricComponent),
      ObjectvaluesPipe
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should contain 2 config elements', () => {
    expect(spectator.queryAll('app-config-element')).toHaveLength(2);
  });

});
