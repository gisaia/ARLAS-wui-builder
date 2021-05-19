import { CollectionComponent } from './collection.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { MainFormManagerService } from '@services/main-form-manager/main-form-manager.service';

describe('CollectionComponent', () => {
  let spectator: Spectator<CollectionComponent>;

  const createComponent = createComponentFactory({
    component: CollectionComponent,
    providers: [
      mockProvider(MainFormManagerService),
      mockProvider(MainFormService, {
        getMainCollection: () => ''
      }),
      mockProvider(ArlasCollaborativesearchService)
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
