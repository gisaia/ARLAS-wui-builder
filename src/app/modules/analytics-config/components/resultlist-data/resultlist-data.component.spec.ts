import { FormControl, FormGroup } from '@angular/forms';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { EditResultlistColumnsComponent } from '../edit-resultlist-columns/edit-resultlist-columns.component';
import { EditResultlistDetailsComponent } from '../edit-resultlist-details/edit-resultlist-details.component';
import { ResultlistDataComponent } from './resultlist-data.component';

describe('ResultlistDataComponent', () => {
  let spectator: Spectator<ResultlistDataComponent>;

  const createComponent = createComponentFactory({
    component: ResultlistDataComponent,
    declarations: [
      MockComponent(EditResultlistColumnsComponent),
      MockComponent(EditResultlistDetailsComponent),
    ],
    providers: [
      mockProvider(CollectionService, {
        getCollectionFields: () => of([])
      }),
    ]
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        control: new FormGroup({
          columns: new FormControl(''),
          details: new FormControl(''),
        })
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
