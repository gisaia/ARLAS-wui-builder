import { Component } from '@angular/core';
import { FormArray } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';
import { ObjectvaluesPipe } from '@shared/pipes/objectvalues.pipe';
import { MockComponent, MockDirective } from 'ng-mocks';
import { EditLayerComponent } from './edit-layer.component';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { MapLayerFormBuilderService } from '@map-config/services/map-layer-form-builder/map-layer-form-builder.service';
import { ConfigFormGroup } from '@shared-models/config-form';
import {
  MapVisualisationFormBuilderService
} from '@map-config/services/map-visualisation-form-builder/map-visualisation-form-builder.service';

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
          getLayersFa: () => new FormArray([]),
          getVisualisationsFa: () => new FormArray([])
        }
      }),
      mockProvider(MapLayerFormBuilderService, {
        buildLayer: () => new ConfigFormGroup({})
      }),
      mockProvider(MapVisualisationFormBuilderService, {
        buildVisualisation: () => new ConfigFormGroup({})
      })
    ],
    declarations: [
      DummyComponent,
      MockComponent(ConfigFormGroupComponent)
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
