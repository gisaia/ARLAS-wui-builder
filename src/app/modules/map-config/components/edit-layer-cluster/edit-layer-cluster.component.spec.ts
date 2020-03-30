import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayerClusterComponent } from './edit-layer-cluster.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { MockComponent } from 'ng-mocks';
import { EditLayerModeFormComponent } from '../edit-layer-mode-form/edit-layer-mode-form.component';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';

describe('EditLayerClusterComponent', () => {
  let spectator: Spectator<EditLayerClusterComponent>;
  const createComponent = createComponentFactory({
    component: EditLayerClusterComponent,
    declarations: [
      MockComponent(EditLayerModeFormComponent),
      MockComponent(ConfigElementComponent)
    ]
  });

  beforeEach(() => spectator = createComponent({
    props: {
      submit: new Subject<boolean>().asObservable(),
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
