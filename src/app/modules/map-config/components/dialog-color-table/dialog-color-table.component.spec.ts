import { DialogColorTableComponent } from './dialog-color-table.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MockComponent } from 'ng-mocks';
import { ColorPickerWrapperComponent } from '@shared-components/color-picker-wrapper/color-picker-wrapper.component';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { CollectionService } from '@services/collection-service/collection.service';
import { ArlasColorService } from 'arlas-web-components';

describe('DialogColorTableComponent', () => {
  let spectator: Spectator<DialogColorTableComponent>;

  const createComponent = createComponentFactory({
    component: DialogColorTableComponent,
    providers: [
      {
        provide: MAT_DIALOG_DATA, useValue: {
          collection: '',
          sourceField: '',
          keywordColors: []
        }
      },
      mockProvider(ArlasColorService)
    ],
    declarations: [
      MockComponent(ColorPickerWrapperComponent)
    ],
    mocks: [
      MatDialogRef,
      ArlasCollaborativesearchService,
      ArlasColorService,
      CollectionService,
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
