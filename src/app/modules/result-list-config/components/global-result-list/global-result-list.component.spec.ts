import { async, TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { createComponentFactory, createServiceFactory, mockProvider, Spectator, SpectatorService } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';

import { GlobalResultListComponent } from './global-result-list.component';

describe('GlobalResultListComponent', () => {
  let spectator: Spectator<GlobalResultListComponent>;
  let collectionServiceSpectator: SpectatorService<CollectionService>;
  const collectionService = createServiceFactory(CollectionService);
  const createComponent = createComponentFactory({
    component: GlobalResultListComponent,
    declarations: [
      MockComponent(ConfigFormGroupComponent),
      MockComponent(ConfigFormControlComponent)
    ],
    providers: [
      mockProvider(CollectionService, {
        getCollectionFieldsNames: () => of([])
      }),
      mockProvider(MainFormService, {
        getMainCollection: () => '',
        resultListConfig: {
          getResultListsFa: () => new FormArray([])
        }
      })
    ]
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GlobalResultListComponent],
      providers: [
        mockProvider(CollectionService, {
          getCollectionFieldsNames: () => of([])
        }),
        mockProvider(MainFormService, {
          getMainCollection: () => ''
        })
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    spectator = createComponent();
    collectionServiceSpectator = collectionService();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
