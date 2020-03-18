import { DialogColorTableComponent } from './dialog-color-table.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MockComponent } from 'ng-mocks';
import { ColorPickerWrapperComponent } from '@shared-components/color-picker-wrapper/color-picker-wrapper.component';
import { ArlasCollaborativesearchService, ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { HttpClient } from '@angular/common/http';
import { CollectionService } from '@services/collection-service/collection.service';

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
      }
    ],
    entryComponents: [
      DialogColorTableComponent
    ],
    declarations: [
      MockComponent(ColorPickerWrapperComponent)
    ],
    mocks: [
      MatDialogRef,
      ArlasCollaborativesearchService,
      ArlasColorGeneratorLoader,
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
