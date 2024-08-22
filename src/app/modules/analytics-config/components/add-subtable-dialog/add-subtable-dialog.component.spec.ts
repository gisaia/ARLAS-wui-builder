import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AddSubtableDialogComponent } from './add-subtable-dialog.component';
import { CollectionService } from '@services/collection-service/collection.service';
import { of } from 'rxjs';

describe('AddSubtableDialogComponent', () => {
  let spectator: Spectator<AddSubtableDialogComponent>;

  const createComponent = createComponentFactory({
    component: AddSubtableDialogComponent,
    providers: [
      mockProvider(CollectionService, {
        getCollections: () => [],
        getCollectionFields: () => of([])
      }), {
        provide: MAT_DIALOG_DATA, useValue: {
          collection: 'test',
          subTable: undefined
        }
      },
    ],
    declarations: [

    ],
    imports: [
      MatDialogModule],
    mocks: [
      MatDialogRef
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});


