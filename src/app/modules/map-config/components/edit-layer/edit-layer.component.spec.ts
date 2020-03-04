import { EditLayerComponent } from './edit-layer.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { MockComponent } from 'ng-mocks';
import { Component } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { EditLayerFeaturesComponent } from '../edit-layer-features/edit-layer-features.component';

@Component({ template: '' }) class DummyComponent { }

describe('EditLayerComponent', () => {
  let spectator: Spectator<EditLayerComponent>;
  const createComponent = createComponentFactory({
    component: EditLayerComponent,
    imports: [
      RouterTestingModule.withRoutes([{ path: 'map-config/layers', component: DummyComponent }])
    ],
    declarations: [
      DummyComponent,
      MockComponent(ConfigElementComponent),
      MockComponent(EditLayerFeaturesComponent)
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should contain 2 config elements', () => {
    expect(spectator.queryAll('app-config-element')).toHaveLength(2);
  });

});
