import { Component } from '@angular/core';
import { FormArray } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';
import { ObjectvaluesPipe } from '@shared/pipes/objectvalues.pipe';
import { MockComponent, MockDirective } from 'ng-mocks';
import { EditLayerClusterComponent } from '../edit-layer-cluster/edit-layer-cluster.component';
import { EditLayerFeatureMetricComponent } from '../edit-layer-feature-metric/edit-layer-feature-metric.component';
import { EditLayerFeaturesComponent } from '../edit-layer-features/edit-layer-features.component';
import { EditLayerComponent } from './edit-layer.component';

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
      MockComponent(EditLayerClusterComponent),
      MockDirective(ResetOnChangeDirective),
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
