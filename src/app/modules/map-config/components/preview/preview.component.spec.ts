import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import {
  ArlasCollaborativesearchService, ArlasColorGeneratorLoader,
  ArlasConfigurationUpdaterService, ArlasStartupService, PersistenceService
} from 'arlas-wui-toolkit';
import { MockComponent } from 'ng-mocks';
import { PreviewComponent } from './preview.component';
import { ArlasColorService, MapglComponent } from 'arlas-web-components';

describe('PreviewComponent', () => {

  let spectator: Spectator<PreviewComponent>;
  const createComponent = createComponentFactory({
    declarations: [
      MockComponent(MapglComponent)
    ],
    providers: [
      mockProvider(HttpClient),
      mockProvider(ArlasCollaborativesearchService),
      mockProvider(ArlasConfigurationUpdaterService),
      mockProvider(ArlasColorGeneratorLoader),
      mockProvider(ArlasColorService),
      mockProvider(ArlasStartupService),
      mockProvider(CollectionService),
      mockProvider(PersistenceService),
      { provide: MatDialogRef, useValue: {} },
      {
        provide: MAT_DIALOG_DATA, useValue: {
          mapglContributor: null,
          mapComponentConfig: {
            input: {}
          }
        }
      }
    ],
    component: PreviewComponent,
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});

