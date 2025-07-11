import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { MainFormManagerService } from '@services/main-form-manager/main-form-manager.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { CollectionService } from '../../services/collection-service/collection.service';
import { CollectionComponent } from './collection.component';

describe('CollectionComponent', () => {
  let spectator: Spectator<CollectionComponent>;

  const createComponent = createComponentFactory({
    component: CollectionComponent,
    providers: [
      mockProvider(MainFormManagerService),
      mockProvider(MainFormService, {
        getMainCollection: () => '',
        getAllCollections: (collectionService: CollectionService) => []
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
